import { NextResponse } from "next/server";

export function ok(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function errorResponse(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: (error as Error).message || "Internal error" },
    { status: 500 }
  );
}
