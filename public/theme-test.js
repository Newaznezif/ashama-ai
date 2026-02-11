/* Quick Theme Test - Add this temporarily to verify themes work */
console.log('Theme CSS loaded');

/* Test: Apply a theme color immediately */
document.documentElement.style.setProperty('--color-primary', '#DA291C');
document.documentElement.style.setProperty('--color-background', '#FDFDFD');

console.log('CSS variables set:', {
    primary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
    background: getComputedStyle(document.documentElement).getPropertyValue('--color-background')
});
