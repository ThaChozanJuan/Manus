# Seedli ROI Calculator

This repository contains a static clone of the Seedli ROI Calculator page, recreated pixel-for-pixel and behavior-for-behavior, designed for easy deployment on static hosting platforms like GitHub Pages.

## Quick Publish (GitHub Pages)

To quickly publish this calculator on GitHub Pages:

1.  Create a new GitHub repository.
2.  Upload all files and folders from this project to your new repository.
3.  Go to your repository **Settings**.
4.  Navigate to the **Pages** section.
5.  Under "Build and deployment", select **GitHub Actions** as the source.
6.  Wait for the GitHub Actions workflow to complete (indicated by a green tick).
7.  Open your published site at `https://USERNAME.github.io/seedli-roi-calculator` (replace `USERNAME` with your GitHub username).

## Embed

YouYou can embed this calculator into another website (e.g., Framer, Webflow, WordPress) using an iframe. Adjust the `height` attribute as needed to fit your content:

```html
<iframe
  src="https://USERNAME.github.io/seedli-roi-calculator"
  width="100%" height="820"
  style="border:0;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.06)"
  loading="lazy"></iframe>
```

## Edit defaults

To change the default input values or labels, modify the `assets/app.js` file. The `ROICalculator` class constructor contains an `inputs` object where you can adjust the initial values. Labels can be found and modified directly in `index.html`.

## No external assets

This calculator is designed to work completely offline and without any external requests at runtime. All styles, scripts, images, and fonts are self-contained within the project, using relative paths. This ensures it functions correctly when hosted under a subpath (e.g., `https://USERNAME.github.io/REPO/`).
