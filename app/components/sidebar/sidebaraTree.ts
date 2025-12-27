export const treeItems = [
  {
    key: 'student',
    label: 'សិស្ស',
    kbd: 'E',
    children: [
      { key: 'student-general', label: 'សិស្សទូទៅ', kbd: 'L', to: '/students' },
      { key: 'student-service', label: 'សេវាកម្មសិស្ស', kbd: 'H', to: '/staff/log/reason' }
    ]
  },
  {
    key: 'student-management',
    label: 'គ្រប់គ្រងសិស្ស',
    kbd: 'M',
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
      { key: 'staff-log', label: 'កំណត់ហេតុ', kbd: 'L', to: '/employee' },
      { key: 'staff-reason', label: 'របាយការណ៏', kbd: 'H', to: '/employee/report' }
    ]
  },
  {
    key: 'cms',
    label: 'មុខងារ',
    kbd: 'C',
    children: [
      { key: 'cms-user', label: 'អ្នកប្រើប្រាស់', kbd: 'L', to: '/users' },
      { key: 'cms-report', label: 'កំណត់សិទ្ធអ្នកប្រើប្រាស់', kbd: 'H', to: '/cms/report' }
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
  },
  {
    key: 'score',
    label: 'ពិន្ទុសិស្ស',
    kbd: 'H',
    children: [
      { key: 'score-data', label: 'ពិន្ទុ', kbd: 'L', to: '/scroe' },
      { key: 'score-summary', label: 'ការបូកសរុប', kbd: 'H', to: '/' }
    ]
  }
]
