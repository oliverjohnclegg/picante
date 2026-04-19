jest.mock('@expo-google-fonts/fraunces', () => ({
  __esModule: true,
  useFonts: jest.fn().mockReturnValue([true, null]),
  Fraunces_600SemiBold: 'Fraunces_600SemiBold',
  Fraunces_700Bold: 'Fraunces_700Bold',
  Fraunces_900Black: 'Fraunces_900Black',
}));

jest.mock('@expo-google-fonts/inter', () => ({
  __esModule: true,
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
  Inter_700Bold: 'Inter_700Bold',
}));

import { useFonts as useGoogleFonts } from '@expo-google-fonts/fraunces';
import { useAppFonts } from '@ui/useFonts';

const mockedUseGoogleFonts = useGoogleFonts as jest.MockedFunction<typeof useGoogleFonts>;

describe('useAppFonts', () => {
  it('registers all required font families with useFonts', () => {
    const result = useAppFonts();
    expect(result).toEqual([true, null]);
    expect(mockedUseGoogleFonts).toHaveBeenCalledTimes(1);
    expect(mockedUseGoogleFonts).toHaveBeenCalledWith({
      Fraunces_600SemiBold: 'Fraunces_600SemiBold',
      Fraunces_700Bold: 'Fraunces_700Bold',
      Fraunces_900Black: 'Fraunces_900Black',
      Inter_400Regular: 'Inter_400Regular',
      Inter_500Medium: 'Inter_500Medium',
      Inter_600SemiBold: 'Inter_600SemiBold',
      Inter_700Bold: 'Inter_700Bold',
    });
  });
});
