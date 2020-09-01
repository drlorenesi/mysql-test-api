module.exports = () => {
  if (!process.env.jwtPrivateKey) {
    console.error(chalk.red('FATAL ERROR: jwtPrivateKey is not defined.'));
    process.exit(1);
  }
};
