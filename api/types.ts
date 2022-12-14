export type Job = {
  id?: number;
  type?: string;
  attributes: Partial<Attributes>;
  skills: Partial<SkillsEntity>;
  company: Partial<Company>;
};
export type Attributes = {
  id: number;
  title: string;
  slug: string;
  intro?: null;
  technologies?: null;
  location: string;
  application_email: string;
  salary_min?: number | null;
  salary_max?: number | null;
  application_url: string;
  skills?: SkillsEntity[] | null;
  job_post_date: string;
  japanese_level?: string | null;
  japanese_level_enum: string;
  is_internship: boolean;
  is_japanese_only: boolean;
  published_at: string;
  position: number;
  updated_at: string;
  remote_level: string;
  candidate_location: string;
  company: Company;
};
export type SkillsEntity = {
  name: string;
  system_name?: string;
  position?: number;
  short_name?: string | null;
  featured?: boolean;
};
export type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  location: string;
  created_at: string;
  published: boolean;
  updated_at: string;
  published_at: string;
  is_home_published: boolean;
  home_rating?: null;
  short_description: string;
};
