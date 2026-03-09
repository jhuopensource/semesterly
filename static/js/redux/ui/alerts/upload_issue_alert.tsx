import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { alertsActions } from "../../state/slices";

// This alert pops up when a user tries to upload a transcript and it fails. It allows them to dismiss the alert.
const UploadIssueAlert = () => {
  const dispatch = useAppDispatch();
  const { alertUploadIssue, uploadIssueMessage } = useAppSelector(
    (state) => state.alerts
  );

  useEffect(() => {
    // Dismiss automatically after 5 secs
    const timer = setTimeout(() => {
      dispatch(alertsActions.dismissAlertUploadIssue());
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!alertUploadIssue) return null;

  return (
    <div className="upload-alert">
      <span>{uploadIssueMessage || "Transcript failed to upload."}</span>
    </div>
  );
};

export default UploadIssueAlert;
