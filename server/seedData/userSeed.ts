import User from '../models/User';

const users = [
  {
    google_id: 'google_user_1',
    email: 'user1@example.com',
    name: 'John Doe',
    profile_picture: 'https://example.com/profile1.jpg',
    categories: 'Food & Drink' as 'Food & Drink',
    location: 'New York',
    is_vendor: false,
  },
  {
    google_id: 'google_user_2',
    email: 'user2@example.com',
    name: 'Jane Smith',
    profile_picture: 'https://example.com/profile2.jpg',
    categories: 'Art' as 'Art',
    location: 'San Francisco',
    is_vendor: true,
  },
  {
    google_id: 'google_user_3',
    email: 'user3@example.com',
    name: 'Michael Johnson',
    profile_picture: 'https://example.com/profile3.jpg',
    categories: 'Sports & Fitness' as 'Sports & Fitness',
    location: 'Los Angeles',
    is_vendor: false,
  },
  {
    google_id: 'google_user_4',
    email: 'user4@example.com',
    name: 'Emily Davis',
    profile_picture: 'https://example.com/profile4.jpg',
    categories: 'Music' as 'Music',
    location: 'Chicago',
    is_vendor: false,
  },
];

async function seedUsers() {
  try {
    for (const user of users) {
      await User.create(user);
    }
    console.log('User seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();
