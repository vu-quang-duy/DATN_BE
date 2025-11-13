import slugify from 'slugify';

export class StringUtil {
  static capitalizeFirstLetter = (str) => {
    // Convert the first character to uppercase and the rest to lowercase
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  private static cleanSlug = (slug) => {
    // Convert to lowercase
    slug = slug.toLowerCase();
    // Replace spaces with hyphens
    slug = slug.replace(/\s+/g, '-');
    // Remove all characters that are not alphanumeric, hyphens, or underscores
    slug = slug.replace(/[^a-z0-9-_]/g, '');
    // Remove any leading or trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
  };

  static createSlug = (value) => (value ? this.cleanSlug(slugify(value)) : value);
}
