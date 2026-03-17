export interface StreetSegment {
  id: string;
  name: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  subType?: 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
  pvi: number; // Plant Volume Index
  svi: number; // Sky View Index
  score: number;
  coordinates: [number, number][]; // LineString
  panorama?: {
    before: string;
    after: string;
  };
}

export const HCMC_STREETS: StreetSegment[] = [
  {
    id: '1',
    name: 'Le Loi Street',
    grade: 'C',
    pvi: 0.45,
    svi: 0.65,
    score: 65,
    coordinates: [[10.7735, 106.6994], [10.7715, 106.7024]],
  },
  {
    id: '2',
    name: 'Nguyen Hue Walking Street',
    grade: 'A',
    pvi: 0.85,
    svi: 0.45,
    score: 92,
    coordinates: [[10.7755, 106.7044], [10.7725, 106.7074]],
  },
  {
    id: '3',
    name: 'District 1 Alleyway',
    grade: 'E',
    subType: 'E2',
    pvi: 0.15,
    svi: 0.10,
    score: 25,
    coordinates: [[10.7785, 106.6954], [10.7795, 106.6964]],
    panorama: {
      before: 'https://images.unsplash.com/photo-1555819232-678456ac3a22?auto=format&fit=crop&q=80&w=2000', // Placeholder for 360
      after: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000', // Placeholder for 360
    }
  },
  {
    id: '4',
    name: 'Vo Van Kiet Highway',
    grade: 'E',
    subType: 'E5',
    pvi: 0.20,
    svi: 0.85,
    score: 35,
    coordinates: [[10.7655, 106.6854], [10.7605, 106.6754]],
    panorama: {
      before: 'https://images.unsplash.com/photo-1518005020250-675f04031468?auto=format&fit=crop&q=80&w=2000',
      after: 'https://images.unsplash.com/photo-1518005020250-675f04031468?auto=format&fit=crop&q=80&w=2000',
    }
  },
  {
    id: '5',
    name: 'Pham Ngu Lao',
    grade: 'D',
    pvi: 0.35,
    svi: 0.55,
    score: 48,
    coordinates: [[10.7685, 106.6924], [10.7665, 106.6904]],
  },
  {
    id: '6',
    name: 'High PVI Zone',
    grade: 'E',
    subType: 'E1',
    pvi: 0.05,
    svi: 0.95,
    score: 15,
    coordinates: [[10.7855, 106.7054], [10.7885, 106.7084]],
  }
];

export const STRATEGIES = [
  {
    id: 'E1',
    title: 'High PVI/SVI Reconstruction',
    description: 'Large-scale canopy restoration for wide streets with high exposure.',
    domain: 'Public',
    approach: 'Top-down Planning',
    details: 'Requires government-led infrastructure overhaul and large tree planting programs.'
  },
  {
    id: 'E2',
    title: 'Narrow Alley Vertical Greening',
    description: 'Vertical gardens and wall-mounted greenery for dense, narrow corridors.',
    domain: 'Private',
    approach: 'Policy-driven / Community',
    details: 'Relies on resident participation and facade modifications. Incentives needed.'
  },
  {
    id: 'E3',
    title: 'Heritage Street Preservation',
    description: 'Sensitive greening that respects historical architectural context.',
    domain: 'Public',
    approach: 'Conservation-led',
    details: 'Focus on low-impact species and traditional landscape design.'
  },
  {
    id: 'E4',
    title: 'Commercial Hub Greening',
    description: 'Integrated green spaces within retail and business districts.',
    domain: 'Mixed',
    approach: 'Public-Private Partnership',
    details: 'Co-funding between city and business owners for pocket parks.'
  },
  {
    id: 'E5',
    title: 'Ecological Parking Conversion',
    description: 'Transforming asphalt parking lots into permeable, green surfaces.',
    domain: 'Public',
    approach: 'Top-down Planning',
    details: 'Replacing hard surfaces with grass pavers and bioswales.'
  }
];
