import localFont from 'next/font/local';

export const coolveticaFont = localFont({
    src: [
        {
            path: './fonts/Coolvetica-Rg.otf',
            weight: '400', // Regular
            style: 'normal',
        },
        {
            path: './fonts/Coolvetica-Rg-It.otf',
            weight: '400', // Regular Italic
            style: 'italic',
        },
        {
            path: './fonts/Coolvetica-Rg-Cram.otf',
            weight: '500', // Semi-bold or medium compressed
            style: 'normal',
        },
        {
            path: './fonts/Coolvetica-Rg-Cond.otf',
            weight: '600', // Condensed variant, slightly bolder
            style: 'normal',
        },
        {
            path: './fonts/Coolvetica-Hv-Comp.otf',
            weight: '700', // Heavy compressed – Bold
            style: 'normal',
        },
    ],
    variable: '--font-coolvetica',
    display: 'swap',
});
