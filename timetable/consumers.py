import json
from collections import defaultdict
from urllib.parse import parse_qs

from channels.generic.websocket import AsyncJsonWebsocketConsumer

from semesterly.settings import ENABLE_SOCIAL_SYNC_GHOST
from timetable.realtime import get_shared_timetable_group

ROOM_PRESENCE = defaultdict(dict)


class SharedTimetableConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not ENABLE_SOCIAL_SYNC_GHOST:
            await self.close()
            return
        self.slug = self.scope["url_route"]["kwargs"]["slug"]
        self.group_name = get_shared_timetable_group(self.slug)
        self.peer_id = self.channel_name
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        query_params = parse_qs(self.scope.get("query_string", b"").decode())
        role = query_params.get("role", ["viewer"])[0]
        display_name = query_params.get("name", ["Guest"])[0]
        ROOM_PRESENCE[self.group_name][self.channel_name] = {
            "id": self.peer_id,
            "name": display_name,
            "role": role,
        }
        await self._broadcast_presence_sync()
        await self.send_json(
            {"type": "connection.ready", "slug": self.slug, "connected": True}
        )

    async def disconnect(self, close_code):
        room = ROOM_PRESENCE.get(self.group_name, {})
        if self.channel_name in room:
            del room[self.channel_name]
            if room:
                ROOM_PRESENCE[self.group_name] = room
            else:
                ROOM_PRESENCE.pop(self.group_name, None)
            await self._broadcast_presence_sync()
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if text_data:
            try:
                payload = json.loads(text_data)
            except json.JSONDecodeError:
                payload = {}
            if payload.get("type") == "ping":
                await self.send_json({"type": "pong"})
            if payload.get("type") == "presence.hello":
                existing_peer = ROOM_PRESENCE[self.group_name].get(self.channel_name, {})
                existing_peer["name"] = payload.get("name") or existing_peer.get(
                    "name", "Guest"
                )
                existing_peer["role"] = payload.get("role") or existing_peer.get(
                    "role", "viewer"
                )
                existing_peer["id"] = self.peer_id
                ROOM_PRESENCE[self.group_name][self.channel_name] = existing_peer
                await self._broadcast_presence_sync()

    async def timetable_update(self, event):
        await self.send_json(event["payload"])

    async def _broadcast_presence_sync(self):
        peers = list(ROOM_PRESENCE.get(self.group_name, {}).values())
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "timetable_update",
                "payload": {
                    "type": "presence.sync",
                    "slug": self.slug,
                    "peers": peers,
                },
            },
        )
