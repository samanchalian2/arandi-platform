-- Page routes are canonical public identifiers and must be race-safe.
CREATE UNIQUE INDEX "Page_route_key" ON "Page"("route");
