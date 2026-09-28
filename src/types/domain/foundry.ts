import type { Lang } from './font';

export type Foundry = {
  id: string;
  name: string;
  nameEn: string;
  mark: string;
  location: string;
  langs: Lang[];
  bio: string;
  followers: number;
  links: { website?: string; instagram?: string; behance?: string };
  verified?: boolean;
};

export type ReviewStatus = 'published' | 'review' | 'rejected' | 'draft';

export type StudioFont = {
  id: string;
  name: string;
  status: ReviewStatus;
  weights: number;
  downloads: number;
  updatedAt: string;
  note?: string;
};
