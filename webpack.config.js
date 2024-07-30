const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/App.js',
  output: {
    filename: 'chatbot-widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ChatbotWidget',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ]
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
