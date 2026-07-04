import { groq } from 'next-sanity';

export const allPortfolioItemsQuery = groq`
  *[_type == "portfolioItem"] | order(displayOrder asc, _createdAt desc) {
    _id,
    category,
    artistName,
    image,
    "imgWidth": image.asset->metadata.dimensions.width,
    "imgHeight": image.asset->metadata.dimensions.height
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroImage
  }
`;
