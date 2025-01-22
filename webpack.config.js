import path from 'node:path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Server-side configuration
  {
    entry: './server.js',
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    mode: 'development'
  },
  // Client-side configuration
  {
    entry: './app/client.jsx',
    output: {
      filename: 'client.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    mode: 'development'
  },
];