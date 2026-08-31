export type UserRole = 'user' | 'admin' | 'mechanic' | 'trainee' | null | undefined;

export type NavItem = {
  href?: string;
  labelKey: string;
  descriptionKey: string;
};

export type NavCategory = {
  labelKey: string;
  descriptionKey: string;
  items: NavItem[];
  current?: boolean;
};

export function getSiteNavigation(role?: UserRole): NavCategory[] {
  const canCreateJobs = role === 'admin' || role === 'mechanic';

  return [
    {
      labelKey: 'navigation.industrialServices',
      descriptionKey: 'navigation.industrialServicesDescription',
      items: [
        {
          href: '/#areas',
          labelKey: 'navigation.automationSystems',
          descriptionKey: 'navigation.automationSystemsDescription',
        },
        {
          href: '/#services',
          labelKey: 'navigation.industrialMaintenance',
          descriptionKey: 'navigation.industrialMaintenanceDescription',
        },
        {
          href: '/#projects',
          labelKey: 'navigation.fabricationProjects',
          descriptionKey: 'navigation.fabricationProjectsDescription',
        },
      ],
    },
    {
      labelKey: 'navigation.automotiveServices',
      descriptionKey: 'navigation.automotiveServicesDescription',
      items: [
        {
          href: '/jobs',
          labelKey: 'navigation.repairOrders',
          descriptionKey: 'navigation.repairOrdersDescription',
        },
        {
          href: '/cars',
          labelKey: 'navigation.customerVehicles',
          descriptionKey: 'navigation.customerVehiclesDescription',
        },
        ...(canCreateJobs
          ? [
              {
                href: '/jobs/new',
                labelKey: 'navigation.newJob',
                descriptionKey: 'navigation.newJobDescription',
              },
            ]
          : []),
      ],
    },
    ...(role === 'admin'
      ? [
          {
            labelKey: 'navigation.adminTools',
            descriptionKey: 'navigation.adminToolsDescription',
            items: [
              {
                href: '/admin/users',
                labelKey: 'navigation.adminUsers',
                descriptionKey: 'navigation.adminUsersDescription',
              },
              {
                href: '/attendance',
                labelKey: 'navigation.attendance',
                descriptionKey: 'navigation.attendanceDescription',
              },
            ],
          },
        ]
      : []),
    {
      labelKey: 'navigation.quotationServices',
      descriptionKey: 'navigation.quotationServicesDescription',
      items: [
        {
          href: '/separadores',
          labelKey: 'navigation.spacers',
          descriptionKey: 'navigation.spacersDescription',
        },
        {
          href: '/poleas',
          labelKey: 'navigation.pulleys',
          descriptionKey: 'navigation.pulleysDescription',
        },
        {
          href: '/engranajes',
          labelKey: 'navigation.gears',
          descriptionKey: 'navigation.gearsDescription',
        },
      ],
    },
    {
      labelKey: 'navigation.trainingPrograms',
      descriptionKey: 'navigation.trainingProgramsDescription',
      items: [
        {
          href: '/#why-choose',
          labelKey: 'navigation.apprenticeTrack',
          descriptionKey: 'navigation.apprenticeTrackDescription',
        },
        {
          href: '/#strengths',
          labelKey: 'navigation.workshopLabs',
          descriptionKey: 'navigation.workshopLabsDescription',
        },
        {
          href: '/#contact',
          labelKey: 'navigation.mentorshipSessions',
          descriptionKey: 'navigation.mentorshipSessionsDescription',
        },
      ],
    },
  ];
}
