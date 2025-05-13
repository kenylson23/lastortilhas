import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password hash:', hashedPassword);
  return hashedPassword;
}

// Gerar hash para a senha 'admin123'
hashPassword('admin123').then(hash => {
  console.log('Hash gerado pronto para inserção no banco de dados');
});