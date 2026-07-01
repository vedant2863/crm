# Project Overview

## Description
CRM OS is a modern, full-stack Customer Relationship Management application designed to serve multiple organizations (multi-tenant) securely and collaboratively. The application focuses on tracking contacts, managing sales deals through Kanban pipelines, assigning and monitoring task checklists, and generating AI-powered insights.

## Core Target Requirements
- **1000 Concurrent Users:** Optimized to run efficiently on a single instance using in-memory caching, connection pooling, and fast query execution patterns.
- **Zero-Dependency Scaling:** Upgraded without adding any external package dependencies.
- **High Security & Hardening:** Includes sliding window rate limiting, secure cookies, brute-force lockout, ReDoS vulnerability prevention, and security headers.
- **Collaborative Sharing:** Sharing toggle allows teams in the same company/organization to share contacts, deals, tasks, and notification feeds, or restrict them to solo tenants.
