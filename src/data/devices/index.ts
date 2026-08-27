import { Device } from '../../types/device';
import { epsonL3250 } from './epson-l3250';
import { epsonWfC879r } from './epson-wf-c879r';
import { shareLinkGuide } from './share-link-guide';
import { samsungSmartTv } from './samsung-smart-tv';
import { interactiveDisplay75 } from './interactive-display-75';
import { videoConferenceLumens } from './video-conference-lumens';

export const devicesData: Device[] = [
  epsonL3250,
  epsonWfC879r,
  shareLinkGuide,
  samsungSmartTv,
  interactiveDisplay75,
  videoConferenceLumens,
];

export function getDeviceById(id: string): Device | undefined {
  return devicesData.find((device) => device.id === id);
}

export function getDevicesByCategory(categorySlug: string): Device[] {
  return devicesData.filter((device) => device.categorySlug === categorySlug);
}

export function searchDevices(query: string): Device[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return devicesData.filter(
    (device) =>
      device.name.toLowerCase().includes(q) ||
      device.description.toLowerCase().includes(q) ||
      device.specs.some((s) => s.toLowerCase().includes(q))
  );
}
