# Ssquares Tech — React Site

Converted from WordPress/Elementor to a plain React (Vite) project.

## Project Structure

```
ssquares-site/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # All sections & components
    └── App.css         # All styles
```

## Sections Included

| Section | Notes |
|---|---|
| **Header** | Fixed, transparent → white on scroll, mobile hamburger menu |
| **Hero** | Animated illustration, heading, social links |
| **Services Bar** | 4 service items with outlined numbers |
| **About** | 2-col layout with image + text |
| **Works/Portfolio** | 6-item grid with hover overlay |
| **Technologies** | Text + auto-playing card image slider |
| **News** | 3-column blog card grid |
| **Contact** | Form + contact info + social columns |
| **Footer** | Copyright bar |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

## Customisation Notes

- **Images & assets**: All currently loaded from ssquares.co.in CDN. 
  Replace with your own hosted assets by updating the `img` src values in `App.jsx`.
- **Contact form**: The form currently shows a success state on submit.
  Wire it to your backend, EmailJS, Formspree, or any form service.
- **Portfolio single / Blog single / Contact form backend**: Planned for next phase.
- **Colors**: Defined as CSS variables in `App.css` (`:root` block) for easy theming.
- **Fonts**: Poppins (headings) + Roboto (body) via Google Fonts.

## Next Steps (Phase 2)

- React Router for portfolio single pages
- Blog single page template
- Real contact form integration (EmailJS / backend API)
- Animate-on-scroll for more sections
