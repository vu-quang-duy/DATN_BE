import { User } from 'src/entities/user/user.entity';

export const DefaultAdminData: Partial<User>[] = [
  {
    email: 'dev_admin@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Dev Admin',
  },
  {
    email: 'test_admin@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Test Admin',
  },
];

export const DefaultTeacherData: Partial<User>[] = [
  {
    email: 'dev_teacher@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Dev Teacher',
  },
  {
    email: 'test_teacher@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Test Teacher',
  },
];

export const DefaultStudentData: Partial<User>[] = [
  {
    email: 'dev_student@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Dev Student',
  },
  {
    email: 'test_student@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Test Student',
  },
];

export const DefaultVolunteerData: Partial<User>[] = [
  {
    email: 'dev_volunteer@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Dev Volunteer',
  },
  {
    email: 'test_volunteer@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Test Volunteer',
  },
];

export const adminCodeServiceData: Partial<User>[] = [
  {
    email: 'admin_code_service@gmail.com',
    password: 'U2FsdGVkX1/l8FZ79Hb0toPjDVDRk0LTAlNFFntINaw=',
    name: 'Code Server Admin',
  },
];
