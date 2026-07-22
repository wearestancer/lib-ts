export const ThreeDSEnum = ['required', 'none'] as const;
export type ThreeDS = (typeof ThreeDSEnum)[number];
