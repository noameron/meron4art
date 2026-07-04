import { groq } from 'next-sanity';

export const allPortfolioItemsQuery = groq`
  *[_type == "portfolioItem"] | order(displayOrder asc, _createdAt desc) {
    _id,
    category,
    artistName,
    title,
    image
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroImage
  }
`;
