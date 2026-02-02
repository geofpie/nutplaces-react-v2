import { heroui } from "@heroui/theme";

const sharedRadius = {
  small: "12px",
  medium: "16px",
  large: "20px",
};

export default heroui({
  themes: {
    light: {
      layout: {
        radius: sharedRadius,
      },
    },
    dark: {
      layout: {
        radius: sharedRadius,
      },
    },
  },
});
