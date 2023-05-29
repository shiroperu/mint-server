import { ThemeProvider, createTheme } from '@mui/material';
import * as React from 'react';

type MuiProviderProps = {
  children: React.ReactNode;
};

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (main: string, light?: string, dark?: string) => augmentColor({ color: { main, light, dark } });

declare module "@mui/material/styles" {
  interface PaletteOptions {
    white: { main:string };
    black: { main:string };
    lightBlack: { main:string };
    gray: { main:string };
    lightGray: { main:string };
    navy: { main:string };
    orange: { main:string };
  }
}

export const MuiProvider = ({ children }: MuiProviderProps) => {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#3d78d9',
      },
      success: {
        main: '#8fd150',
      },
      error: {
        main: '#f24726',
      },
      white: createColor('#fff'),
      black: createColor('#000'),
      lightBlack: createColor('#474747'),
      gray: createColor('#cecece', '#ebebeb', '#808080'),
      lightGray: createColor('#f5f5f5'),
      navy: createColor('#142b4c'),
      orange: createColor('#F24827'),
    },
    typography: {
      fontFamily: ['Open Sans', 'sans-serif'].join(','),
      fontSize: 14,
    },
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
