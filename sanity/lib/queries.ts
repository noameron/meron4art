import { groq } from 'next-sanity';

export const allPortfolioItemsQuery = groq`
  *[_type == "portfolioItem"] | order(displayOrder asc, _createdAt desc) {
    _id,
    category,
    artistName,
    image,
    "imageUrl": image.asset->url,
    "imgWidth": image.asset->metadata.dimensions.width,
    "imgHeight": image.asset->metadata.dimensions.height
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroIntervalSeconds,
    "aboutImage": aboutImage{
      ...,
      "imgWidth": asset->metadata.dimensions.width,
      "imgHeight": asset->metadata.dimensions.height
    }
  }
`;
