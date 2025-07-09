/**
 * Amazon Product Advertising API Service
 * Handles fetching product data including prices and ratings from Amazon
 */

class AmazonProductAPI {
  constructor() {
    this.baseUrl = 'https://webservices.amazon.com/paapi5';
    this.associateTag = 'your-associate-tag'; // Replace with your Amazon Associate Tag
    this.accessKey = 'YOUR_ACCESS_KEY'; // Replace with your Access Key
    this.secretKey = 'YOUR_SECRET_KEY'; // Replace with your Secret Key
    this.region = 'us-east-1'; // AWS region
    this.cache = new Map();
    this.cacheDuration = 3600000; // 1 hour cache
  }

  /**
   * Generate authentication headers for PA-API
   */
  async generateHeaders(operation, payload) {
    const timestamp = new Date().toISOString().replace(/[\-:]/g, '').split('.')[0] + 'Z';
    const payloadHash = await this.hashPayload(payload);
    
    const canonicalRequest = [
      'POST',
      '/paapi5/getitems',
      '',
      `content-encoding:amz-1.0`,
      `host:webservices.amazon.com`,
      `x-amz-date:${timestamp}`,
      `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
      '',
      'content-encoding;host;x-amz-date;x-amz-target',
      payloadHash
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      `${timestamp.slice(0, 8)}/${this.region}/ProductAdvertisingAPI/aws4_request`,
      await this.hashString(canonicalRequest)
    ].join('\n');

    const signingKey = await this.getSignatureKey(this.secretKey, timestamp.slice(0, 8), this.region, 'ProductAdvertisingAPI');
    const signature = await this.hmac(signingKey, stringToSign, 'hex');
    
    return {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=utf-8',
      'Host': 'webservices.amazon.com',
      'X-Amz-Date': timestamp,
      'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
      'Authorization': `AWS4-HMAC-SHA256 ` +
        `Credential=${this.accessKey}/${timestamp.slice(0, 8)}/${this.region}/ProductAdvertisingAPI/aws4_request, ` +
        `SignedHeaders=content-encoding;host;x-amz-date;x-amz-target, ` +
        `Signature=${signature}`
    };
  }

  /**
   * Get product details including price and rating
   * @param {Array<string>} asins - Array of ASINs to fetch
   * @returns {Promise<Object>} Product data
   */
  async getProducts(asins) {
    const cacheKey = `products_${asins.sort().join('_')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const operation = 'GetItems';
    const payload = {
      ItemIdType: 'ASIN',
      ItemIds: asins,
      Resources: [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'Offers.Summaries.LowestPrice',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.MerchantInfo',
        'BrowseNodeInfo.BrowseNodes',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ],
      PartnerTag: this.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    };

    try {
      const headers = await this.generateHeaders(operation, JSON.stringify(payload));
      const response = await fetch(`${this.baseUrl}/getitems`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      this.addToCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  }

  /**
   * Get price for a single product
   * @param {string} asin - Product ASIN
   * @returns {Promise<{price: string, originalPrice: string, saved: string, isPrime: boolean}>}
   */
  async getProductPrice(asin) {
    try {
      const data = await this.getProducts([asin]);
      if (!data || !data.ItemsResult || !data.ItemsResult.Items.length) {
        return null;
      }

      const item = data.ItemsResult.Items[0];
      const listing = item.Offers?.Listings?.[0];
      const price = listing?.Price?.DisplayAmount || 'N/A';
      const originalPrice = listing?.SavingBasis?.Amount || '';
      const saved = listing?.AmountSaved?.Amount || '';
      const isPrime = listing?.DeliveryInfo?.IsPrimeEligible || false;

      return {
        price,
        originalPrice: originalPrice ? `$${originalPrice}` : '',
        saved: saved ? `Save $${saved}` : '',
        isPrime,
        rating: item.CustomerReviews?.StarRating || 0,
        reviewCount: item.CustomerReviews?.Count || 0
      };
    } catch (error) {
      console.error('Error fetching product price:', error);
      return null;
    }
  }

  // Helper methods for AWS Signature v4
  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.hex(hashBuffer);
  }

  async hashPayload(payload) {
    return await this.hashString(payload || '');
  }

  hex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async hmac(key, message, encoding = '') {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(message)
    );
    
    return encoding === 'hex' ? this.hex(signature) : new Uint8Array(signature);
  }

  async getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = await this.hmac('AWS4' + key, dateStamp);
    const kRegion = await this.hmac(kDate, regionName);
    const kService = await this.hmac(kRegion, serviceName);
    const kSigning = await this.hmac(kService, 'aws4_request');
    return kSigning;
  }

  // Simple cache implementation
  addToCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheDuration
    });
  }

  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
}

// Export singleton instance
export const amazonAPI = new AmazonProductAPI();
