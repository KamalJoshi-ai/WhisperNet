import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import daisyui from "daisyui";
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [
    tailwindcss({
      plugins: [daisyui], 
    }),
     react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
