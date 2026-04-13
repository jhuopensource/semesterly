import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer

from semesterly.settings import ENABLE_SOCIAL_SYNC_GHOST
from timetable.realtime import get_shared_timetable_group


class SharedTimetableConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not ENABLE_SOCIAL_SYNC_GHOST:
            await self.close()
            return
        self.slug = self.scope["url_route"]["kwargs"]["slug"]
        self.group_name = get_shared_timetable_group(self.slug)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json(
            {"type": "connection.ready", "slug": self.slug, "connected": True}
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if text_data:
            try:
                payload = json.loads(text_data)
            except json.JSONDecodeError:
                payload = {}
            if payload.get("type") == "ping":
                await self.send_json({"type": "pong"})

    async def timetable_update(self, event):
        await self.send_json(event["payload"])
