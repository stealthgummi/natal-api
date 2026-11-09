# Easy Chart API - Transparent Astrology Vector Overlay Engine — AWS Marketplace Listing Dossier

## 1. Product Metadata
- **Product Title:** Easy Chart API - Transparent Astrology Vector Overlay Engine
- **Category:** AWS Marketplace > Media & Graphics
- **Fulfillment Method:** SaaS / Data & API Product (AWS API Gateway + Lambda Proxy)
- **Primary AWS Region:** `us-east-2` (US East - Ohio)
- **Architectural Delivery:** Zero-cloud egress, low latency serverless execution via Amazon API Gateway with Amazon CloudWatch logging and AWS WAF inspection.
- **Support Email:** `marketplace-support@7layer.store`
- **Documentation:** `https://api.easy-chart-api.7layer.store/docs`

---

## 2. Product Overview (Search & Listing Summary)

### Short Description
> High-precision astronomical ephemeris that generates a pure, transparent vector SVG overlay of any birth chart. Designed as a headless decal/HUD that developers can drop on top of any custom background, gradient, mobile card, or video loop.... High throughput, low latency REST API deployed in AWS `us-east-2`.

### Executive Value Proposition
The **Easy Chart API - Transparent Astrology Vector Overlay Engine** provides enterprise-grade capabilities built for mission-critical cloud workloads. Integrated directly with AWS API Gateway in **us-east-2**, it allows AWS architects and backend engineers to integrate high-velocity operations without managing backend infrastructure or provisioning dedicated compute clusters.

---

## 3. Product Highlights & Capabilities

- **Native AWS Integration:** Deployed in `us-east-2` with sub-50ms latency across AWS availability zones.
- **Enterprise Security:** API Key and AWS IAM Signature Version 4 (SigV4) authentication.
- **Air-Gapped Cryptographic Determinism:** Predictable, high-throughput microservices designed for zero state corruption.
- **Seamless Pay-As-You-Go Billing:** Unified billing through your AWS Marketplace monthly invoice—no separate credit cards or external contracts.
- **Compliance & Privacy:** Built following strict data-handling isolation, zero data reselling, and ephemeral memory execution.

---

## 4. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/chart.svg` | Generate Transparent Chart Overlay |
| `POST` | `/v1/chart/dossier` | Generate Psychological Dossier & Interpretations |

---

## 5. Quickstart & Integration (AWS Environment)

### Example Request (cURL with API Key)
```bash
curl -X POST "https://{api-id}.execute-api.us-east-2.amazonaws.com/prod/v1/chart.svg" \
  -H "x-api-key: ${AWS_MARKETPLACE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

### Example Request (Node.js SDK)
```javascript
const response = await fetch("https://{api-id}.execute-api.us-east-2.amazonaws.com/prod/v1/chart.svg", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AWS_MARKETPLACE_API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    /* request payload */
  })
});
const data = await response.json();
console.log("Response:", data);
```

---

## 6. AWS Marketplace Pricing Dimensions

| Tier | Request Volume / Quota | Pricing | Features |
| :--- | :--- | :--- | :--- |
| **Free Developer Tier** | 1,000 req/month | $0.00 / mo | 5 req/sec burst, community support |
| **Professional Tier** | 100,000 req/month | $49.00 / mo ($0.0005/req overage) | 50 req/sec burst, standard SLA |
| **Enterprise Production Tier** | 1,000,000 req/month | $299.00 / mo ($0.0003/req overage) | 250 req/sec burst, 99.9% uptime SLA, priority support |
| **Custom Contract** | Unlimited | Custom Annual Commit | Dedicated VPC PrivateLink peering available |

---

## 7. Support & SLA
- **Uptime Target:** 99.9% availability backed by AWS Regional infrastructure.
- **Incident Response:** 24/7 incident alerting for Enterprise tier; <4 hour resolution target for critical severity tickets.
- **Support Portal:** `https://support.7layer.store`
