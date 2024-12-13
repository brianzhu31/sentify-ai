"use client";

export const timeAgo = (publishedDate: Date | string): string => {
  const currentUTCDate = new Date();
  currentUTCDate.setTime(currentUTCDate.getTime() + currentUTCDate.getTimezoneOffset() * 60000);

  const parsedDate = typeof publishedDate === 'string' ? new Date(publishedDate) : publishedDate;

  const diffInMs = currentUTCDate.getTime() - parsedDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    const hoursAgo = Math.round(diffInHours);
    return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  } else {
    const daysAgo = Math.round(diffInHours / 24);
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  }
};
