'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Box } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function AutoBreadcrumbs() {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean); // Remove empty segments

  const crumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;

    const label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem className="flex items-center text-muted-text">
          {isLast ? (
            <BreadcrumbPage className="font-medium text-text">{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href} className="hover:text-primary transition-colors">
                {label}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator className="text-muted-text" />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb className="text-sm">
      <BreadcrumbList className="flex items-center gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/dashboard"
            className="flex items-center gap-1 text-muted-text hover:text-primary transition-colors"
          >
            <Box size={16.5}/>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator className="text-muted-text" />}
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}