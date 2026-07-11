import {
  Home, Building2, Droplets, Sparkles, Briefcase, Layers,
  PaintBucket, Wrench, Hammer, Palette,
} from 'lucide-react'

export const SERVICE_ICONS = { Home, Building2, Droplets, Sparkles, Briefcase, Layers, PaintBucket, Wrench, Hammer, Palette }

export function getServiceIcon(iconName) {
  return SERVICE_ICONS[iconName] || Layers
}
