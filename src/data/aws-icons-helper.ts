import { AWS_ICONS, AwsIcon } from './aws-icons';

// Group icons by category for easier palette organization
export const AWS_ICONS_BY_CATEGORY = AWS_ICONS.reduce((acc, icon) => {
  if (!acc[icon.category]) {
    acc[icon.category] = [];
  }
  acc[icon.category].push(icon);
  return acc;
}, {} as Record<string, AwsIcon[]>);

export const AWS_CATEGORIES = Object.keys(AWS_ICONS_BY_CATEGORY);