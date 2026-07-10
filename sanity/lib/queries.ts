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

// falls back to the retired singular "heroImage" field so a site that
// hasn't been re-edited in Studio yet still shows its existing hero photo
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    "heroImages": select(
      defined(heroImages) && count(heroImages) > 0 => heroImages[]{
        ...,
        "imgWidth": asset->metadata.dimensions.width,
        "imgHeight": asset->metadata.dimensions.height
      },
      defined(heroImage) => [heroImage],
      []
    ),
    "aboutImage": aboutImage{
      ...,
      "imgWidth": asset->metadata.dimensions.width,
      "imgHeight": asset->metadata.dimensions.height
    }
  }
`;
