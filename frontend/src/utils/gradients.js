const parseHexColor = (value) => {
  if (!value) {
    return null;
  }
  const hex = value.startsWith("#") ? value.slice(1) : value;
  if (hex.length !== 6) {
    return null;
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return [r, g, b];
};

const rgbToHslChannels = (rgb) => {
  const [r, g, b] = rgb.map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) {
      hue += 360;
    }
  }
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return `${Math.round(hue)} ${Math.round(
    saturation * 100,
  )}% ${Math.round(lightness * 100)}%`;
};

const mixChannel = (from, to, amount) =>
  Math.round(from + (to - from) * amount);

const buildAccentLeakGradient = (value, isDark) => {
  const rgb = parseHexColor(value) || [59, 130, 246];
  const light = rgb.map((channel) => mixChannel(channel, 255, 0.45));
  const deep = rgb.map((channel) => mixChannel(channel, 0, 0.15));
  const base = isDark ? [0, 0, 0] : [255, 255, 255];
  return [
    `radial-gradient(120% 120% at 10% 20%, rgba(${light.join(
      ", ",
    )}, 0.55) 0%, rgba(${light.join(", ")}, 0) 55%)`,
    `radial-gradient(120% 120% at 90% 10%, rgba(${deep.join(
      ", ",
    )}, 0.45) 0%, rgba(${deep.join(", ")}, 0) 60%)`,
    `linear-gradient(0deg, rgb(${base.join(", ")}), rgb(${base.join(", ")}))`,
  ].join(", ");
};

const buildAccentKpiGradient = (value, isDark, config) => {
  const rgb = parseHexColor(value) || [59, 130, 246];
  const soft = rgb.map((channel) => mixChannel(channel, 255, 0.7));
  const base = isDark ? [16, 16, 16] : [255, 255, 255];
  const angle = config?.angle ?? 135;
  const spotA = config?.spotA ?? "15% 20%";
  const spotB = config?.spotB ?? "85% 10%";
  return [
    `linear-gradient(${angle}deg, rgba(${soft.join(", ")}, 0.12) 0%, rgba(${soft.join(
      ", ",
    )}, 0) 65%)`,
    `radial-gradient(110% 110% at ${spotA}, rgba(${rgb.join(
      ", ",
    )}, 0.08) 0%, rgba(${rgb.join(", ")}, 0) 70%)`,
    `radial-gradient(120% 120% at ${spotB}, rgba(${soft.join(
      ", ",
    )}, 0.06) 0%, rgba(${soft.join(", ")}, 0) 72%)`,
    `linear-gradient(0deg, rgb(${base.join(", ")}), rgb(${base.join(", ")}))`,
  ].join(", ");
};

export {
  parseHexColor,
  rgbToHslChannels,
  buildAccentLeakGradient,
  buildAccentKpiGradient,
};
