export type NavItem = {
  href: string;
  labelKey: string;
  descriptionKey: string;
};

export const siteNavigation: NavItem[] = [
  {
    href: "/cars",
    labelKey: "navigation.cars",
    descriptionKey: "navigation.carsDescription",
  },
  {
    href: "/jobs",
    labelKey: "navigation.jobs",
    descriptionKey: "navigation.jobsDescription",
  },
  {
    href: "/jobs/new",
    labelKey: "navigation.newJob",
    descriptionKey: "navigation.newJobDescription",
  },
  {
    href: "/api-doc",
    labelKey: "navigation.apiDocs",
    descriptionKey: "navigation.apiDocsDescription",
  },
];
