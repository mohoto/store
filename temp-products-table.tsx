      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400 text-4xl">📦</span>
                    <p className="text-gray-500">
                      {searchTerm || selectedCollection
                        ? "Aucun produit ne correspond aux filtres"
                        : "Aucun produit trouvé"
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const hasNouveautesCollection = product.collections.some(
                  (pc) => pc.collection.nom.toLowerCase() === "nouveautés"
                );
                const hasReduction = product.prixReduit != null && product.prixReduit > 0;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                          aria-label="Select row"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-gray-100">
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.nom}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-400">-</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">
                        {product.nom}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {hasNouveautesCollection && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                            N
                          </span>
                        )}
                        {hasReduction && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            P
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        {hasReduction ? (
                          <>
                            <span className="font-semibold text-green-600">
                              {product.prixReduit!.toFixed(2)} €
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {product.prix.toFixed(2)} €
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">
                            {product.prix.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <IconDotsVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleSlug(product)}>
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(product)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredProducts.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              Page {currentPage + 1} sur {totalPages} ({filteredProducts.length} produit(s))
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>