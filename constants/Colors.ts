// Dance With Helen Brand Colors
export const BrandColors = {
  primaryPink: '#FF1AA1',
  lightPink: '#FFC1DD',
  gold: '#C69D74',
  black: '#000000',
  white: '#FFFFFF',
};

const tintColorLight = BrandColors.primaryPink;
const tintColorDark = BrandColors.lightPink;

export default {
  light: {
    text: BrandColors.black,
    background: BrandColors.white,
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: BrandColors.primaryPink,
    secondary: BrandColors.gold,
    accent: BrandColors.lightPink,
  },
  dark: {
    text: BrandColors.white,
    background: BrandColors.black,
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: BrandColors.primaryPink,
    secondary: BrandColors.gold,
    accent: BrandColors.lightPink,
  },
};
