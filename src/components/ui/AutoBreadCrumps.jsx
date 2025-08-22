'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function AutoBreadcrumbs() {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean);

  // Check if a segment is a MongoDB ObjectId (24 hex chars)
  const isMongoId = (str) => /^[a-f\d]{24}$/i.test(str);

  const crumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;

    // Label transformation
    let label = decodeURIComponent(segment).replace(/-/g, ' ');

    // If it's a MongoDB ID, replace with 'View'
    if (isMongoId(segment)) {
      label = 'View';
    } else {
      // Title-case the label
      label = label.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem className="flex  items-center">
          {isLast ? (
            <BreadcrumbPage className="font-semibold text-xs">{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href} className="hover:text-blue-600 font-normal text-xs">
                {label}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb className="hidden md:flex items-center">
      <BreadcrumbList className="flex text-[8px] sm:text-xs items-center gap-0.5 sm:gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="flex items-center gap-0.5 sm:gap-1 hover:text-blue-600">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator />}
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}