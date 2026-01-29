## BEFORE (lines 110-150)
```typescript
  async getAudit(tenantId: string, pageId: string): Promise<CmsSeoAuditEntity> {
    try {
      const audit = await this.auditRepo.findOne({ pageId, tenantId });
      if (!audit) {
        throw new NotFoundException('No audit found for this page');
      }
      return audit;
    } catch (error) {
      throw new NotFoundException('Invalid page ID');
    }
  }

  async getRecommendations(
    tenantId: string,
    pageId: string,
  ): Promise<{ score: number; status: string; issues: string[]; recommendations: string[] }> {
    const audit = await this.getAudit(tenantId, pageId);
    const recommendations: string[] = [];
    const rec = audit.recommendations || {};
    // Defensive: status fallback
    const status = audit.score >= 80 ? 'PASS' : audit.score >= 60 ? 'WARN' : 'FAIL';
    if (!rec.titleTag || rec.titleTag.length < 30) {
      recommendations.push('Increase title tag length to 30-60 characters for better SEO visibility');
    }
    if (!rec.metaDescription || rec.metaDescription.length < 120) {
      recommendations.push('Write a compelling meta description (120-160 chars) to improve CTR from search results');
    }
    if (audit.issues && audit.issues.includes('Missing H1 tag')) {
      recommendations.push('Add an H1 heading that includes your primary keyword');
    }
    if (audit.issues && audit.issues.some((i: string) => i.includes('images missing alt text'))) {
      recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
    }
    recommendations.push('Submit sitemap to Google Search Console');
    recommendations.push('Ensure mobile responsiveness for better mobile rankings');
    recommendations.push('Improve page load speed (target < 3 seconds)');
    return {
      score: audit.score,
      status,
      issues: audit.issues || [],
      recommendations,
    };
  }
```

## AFTER (fixed version)
```typescript
  async getAudit(tenantId: string, pageId: string): Promise<CmsSeoAuditEntity> {
    try {
      const audit = await this.auditRepo.findOne({ pageId, tenantId });
      if (!audit) {
        throw new NotFoundException('No audit found for this page');
      }
      return audit;
    } catch (error) {
      throw new NotFoundException('Invalid page ID');
    }
  }

  async getRecommendations(
    tenantId: string,
    pageId: string,
  ): Promise<{
    score: number;
    status: string;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const audit = await this.getAudit(tenantId, pageId);
      const recommendations: string[] = [];
      const rec = (audit.recommendations as any) || {};

      // Status logic
      const status = audit.score >= 80 ? 'PASS' : audit.score >= 60 ? 'WARN' : 'FAIL';

      // SEO checks
      if (!rec.titleTag || rec.titleTag.length < 30) {
        recommendations.push('Increase title tag length to 30-60 characters for better SEO visibility');
      }
      if (!rec.metaDescription || rec.metaDescription.length < 120) {
        recommendations.push('Write compelling meta description (120-160 chars) to improve CTR');
      }
      if (audit.issues?.includes('Missing H1 tag')) {
        recommendations.push('Add H1 heading that includes your primary keyword');
      }
      if (audit.issues?.some((i: string) => i.includes('images missing alt text'))) {
        recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
      }

      // Default recommendations
      recommendations.push('Submit sitemap to Google Search Console');
      recommendations.push('Ensure mobile responsiveness for better mobile rankings');
      recommendations.push('Improve page load speed (target < 3 seconds)');

      return {
        score: audit.score,
        status,
        issues: audit.issues || [],
        recommendations,
      };
    } catch (error) {
      return {
        score: 0,
        status: 'FAIL',
        issues: ['Service error'],
        recommendations: ['Check service logs'],
      };
    }
  }
```

## BUILD RESULT:
```
[BUILD OUTPUT HERE - user skipped build step]
```

## LINE COUNTS:
- Class starts: line 15
- Method starts: line 119  
- Class ends: line 170
