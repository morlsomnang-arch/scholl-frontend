
export const treeItems = [
   {
    key: 'student',
    label: 'សិស្ស',
    kbd: 'E',
    children: [
      { key: 'staff-log', label: 'សិស្សទូទៅ', kbd: 'L', to: '/students' },
      { key: 'staff-reason', label: 'សេវាកម្មសិស្ស', kbd: 'H', to: '/staff/log/reason' }
    ]
  },
  {
    key: 'student-management',
    label: 'គ្រប់គ្រងសិស្ស',
    kbd: 'M',
    icon: 'i-heroicons-academic-cap',
    children: [
      { key: 'student-log', label: 'កំណត់ហេតុសិស្ស', kbd: 'L', to: '/students/log' },
      { key: 'student-reason', label: 'ហេតុផល', kbd: 'P', to: '/students/log/reason' }
    ]
  },
  {
    key: 'staff',
    label: 'បុគ្គលិក',
    kbd: 'E',
    children: [
      { key: 'staff-log', label: 'កំណត់ហេតុ', kbd: 'L', to: '/staff/log' },
      { key: 'staff-reason', label: 'ហេតុផល', kbd: 'H', to: '/staff/log/reason' }
    ]
  },
  {
    key: 'cms',
    label: 'CMS',
    kbd: 'C',
    children: [
      { key: 'cms-data', label: 'ទិន្នន័យ', kbd: 'L', to: '/cms/data' },
      { key: 'cms-report', label: 'ការបូកសរុប', kbd: 'H', to: '/cms/report' }
    ]
  },
  {
    key: 'home',
    label: 'ទំព័រដើម',
    kbd: 'H',
    children: [
      { key: 'home-data', label: 'ទិន្នន័យ', kbd: 'L', to: '/cms' },
      { key: 'home-summary', label: 'ការបូកសរុប', kbd: 'H', to: '/' }
    ]
  }
]
