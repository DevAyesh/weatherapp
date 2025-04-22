// Utility for visitorId
export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}
