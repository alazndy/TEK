
"use client"

import React from "react";
import { useDataStore } from "@/stores/data-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/proposals/columns"
import { Button } from "@/components/ui/button"
import { PlusCircle, Upload, Loader2 } from "lucide-react"
import { useSearch } from "@/context/search-context";
import { ProposalFormSheet } from "@/components/proposals/proposal-form-sheet";
import { Proposal as ProposalType } from "@/lib/types";

export default function ProposalsPage() {
  const { 
    proposals, 
    loadingProposals,
    fetchProposals,
    hasMoreProposals,
    loadMoreProposals,
    addProposal,
    products
  } = useDataStore();
  const { searchQuery } = useSearch();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    // Fetch initial data only if it hasn't been fetched yet
    if (proposals.length === 0) {
      fetchProposals(true);
    }
  }, [fetchProposals, proposals.length]);


  const handleAddProposal = () => {
    setIsSheetOpen(true);
  };
  
  const handleFormSubmit = async (proposalData: Omit<ProposalType, 'id' | 'pdfUrl'>, pdfFile: File) => {
    await addProposal(proposalData, pdfFile);
    setIsSheetOpen(false);
  };

  const filteredProposals = React.useMemo(() => {
    if (!searchQuery) return proposals;
    const query = searchQuery.toLowerCase();
    return proposals.filter(item => 
      item.proposalNumber?.toLowerCase().includes(query) ||
      item.customerName?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  }, [searchQuery, proposals]);
  
  const customerNames = React.useMemo(() => {
      const names = new Set(proposals.map(p => p.customerName));
      return Array.from(names);
  }, [proposals]);

  const isSearchActive = searchQuery.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Teklifler</CardTitle>
                  <CardDescription>Müşterilerinize gönderdiğiniz fiyat tekliflerini yönetin.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                   <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Dışa Aktar
                  </Button>
                  <Button size="sm" onClick={handleAddProposal}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Teklif Yükle
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingProposals && proposals.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
              <DataTable 
                  columns={columns} 
                  data={filteredProposals}
                  onLoadMore={loadMoreProposals}
                  hasMore={hasMoreProposals}
                  isLoading={loadingProposals}
                  isSearchActive={isSearchActive}
              />
          )}
        </CardContent>
      </Card>
      <ProposalFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        customerNames={customerNames}
        products={products}
      />
    </>
  )
}

    