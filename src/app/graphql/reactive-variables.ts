import { makeVar } from '@apollo/client/core';

export const currentThemeVar = makeVar<string>('light');
export const checkBoxListVar = makeVar<number[]>([]);
export const allSpeakerIdsVar = makeVar<number[]>([]);
