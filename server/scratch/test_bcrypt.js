import bcrypt from 'bcryptjs';

async function test() {
  try {
    const isMatch = await bcrypt.compare('password', '$2b$12$invalidhashfortimingnormalize');
    console.log('isMatch:', isMatch);
  } catch (err) {
    console.error('Error caught:', err);
  }
}

test();
