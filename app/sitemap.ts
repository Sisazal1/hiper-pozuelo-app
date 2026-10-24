import type {MetadataRoute} from 'next';
import {packs} from '@/src/content/packs';
import {SITE_URL} from '@/src/content/site';
export default function sitemap(): MetadataRoute.Sitemap {const routes = ['/', '/packs', '/como-funciona', '/faq', '/recogida', '/legal', '/legal/condiciones-compra', '/legal/devoluciones', '/legal/privacidad', '/legal/aviso-legal', ...packs.map(pack => `/packs/${pack.slug}`)]; return routes.map(url => ({url: `${SITE_URL}${url}`, lastModified: new Date('2026-10-24'), changeFrequency: url.startsWith('/packs') ? 'weekly' : 'monthly', priority: url === '/' ? 1 : 0.7}));}
