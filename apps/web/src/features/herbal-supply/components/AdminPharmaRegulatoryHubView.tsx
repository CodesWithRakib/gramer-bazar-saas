'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck2,
  Search,
  Filter,
  Layers,
  Check,
  X,
  Droplets,
  Microscope,
  Leaf,
  Calendar,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import {
  useGetHerbalOverviewStatsQuery,
  useGetAllAdminContractsQuery,
  useUpdateContractStatusMutation,
  useCreatePharmaContractMutation,
  useGetHerbalBatchesQuery,
  PharmaSourcingContract,
  SourcingContractStatus,
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
} from '../herbalSupplyApi';

export const AdminPharmaRegulatoryHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'QUALITY_AUDIT' | 'NEW_CONTRACT'>('CONTRACTS');
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Contract Form State
  const [buyerCompany, setBuyerCompany] = useState<string>('Ibn Sina Herbal & Modern Medicines Ltd.');
  const [buyerContact, setBuyerContact] = useState<string>('Dr. Kazi Mahbubur Rahman');
  const [buyerPhone, setBuyerPhone] = useState<string>('01711998877');
  const [sellerCoopId, setSellerCoopId] = useState<string>('grower-natore-001');
  const [coopName, setCoopName] = useState<string>('Laxmipur Kholabaria Oushodhi Krishi Samity, Natore');
  const [species, setSpecies] = useState<HerbalSpecies>('KALOMEGH');
  const [plantPart, setPlantPart] = useState<PlantPartUsed>('LEAF_DRIED');
  const [processingState, setProcessingState] = useState<ProcessingState>('SHADE_DRIED_WHOLE');
  const [targetWeightKg, setTargetWeightKg] = useState<number>(1500);
  const [agreedPricePerKg, setAgreedPricePerKg] = useState<number>(315);
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>('2026-12-01');
  const [destinationWarehouse, setDestinationWarehouse] = useState<string>('Savar Herbal Factory Hub');
  const [contractCreatedMsg, setContractCreatedMsg] = useState<string | null>(null);

  const { data: statsData } = useGetHerbalOverviewStatsQuery();
  const { data: contractsData, isLoading: isContractsLoading } = useGetAllAdminContractsQuery();
  const { data: batchesData } = useGetHerbalBatchesQuery();

  const [updateContractStatus, { isLoading: isUpdatingStatus }] = useUpdateContractStatusMutation();
  const [createContract, { isLoading: isCreatingContract }] = useCreatePharmaContractMutation();

  const stats = statsData?.data;
  const contracts = contractsData?.data || [];
  const batches = batchesData?.data || [];

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cooperativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.species.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (contractStatusFilter === 'ALL') return true;
    return c.contractStatus === contractStatusFilter;
  });

  const handleStatusChange = async (id: string, status: SourcingContractStatus) => {
    try {
      await updateContractStatus({ id, status }).unwrap();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setContractCreatedMsg(null);

    try {
      const res = await createContract({
        buyerCompanyName: buyerCompany,
        buyerContactPerson: buyerContact,
        buyerPhone,
        sellerCooperativeId: sellerCoopId,
        cooperativeName: coopName,
        species,
        plantPart,
        processingState,
        targetWeightKg: Number(targetWeightKg),
        agreedPricePerKgBdt: Number(agreedPricePerKg),
        deliveryDeadline,
        destinationWarehouseDistrict: destinationWarehouse,
        specialPharmacopoeiaSpecifications:
          'Standardized accordance with Bangladesh National Ayurvedic Formulary (BNAF). Moisture strictly <= 10.0%.',
      }).unwrap();

      setContractCreatedMsg(`Contract #${res.data.contractNumber} successfully established with 30% advance escrow!`);
    } catch (err) {
      console.error('Failed to create contract', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>DGDA Botanical Quality &amp; Pharma Escrow Control Hub (ঔষধ প্রশাসন ও ভেষজ মান নিয়ন্ত্রণ)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Ayurvedic Pharmacopoeia &amp; Pharma Supply Desk
          </h1>
          <p className="mt-2 text-xs lg:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Directorate General of Drug Administration (DGDA) botanical moisture &amp; aflatoxin quality enforcement,
            institutional supply contracts with Hamdard and Square Herbal, and warehouse intake escrow settlements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[140px]">
            <div className="text-[11px] text-emerald-200">Pharma Grade Ratio</div>
            <div className="text-2xl font-black text-white">{stats?.pharmaGradePercentage ?? 100}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[140px]">
            <div className="text-[11px] text-emerald-200">Trade Volume</div>
            <div className="text-2xl font-black text-emerald-400">
              ৳{((stats?.totalHerbalTradeVolumeBdt ?? 1075000) / 100000).toFixed(1)}L
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-2">
        <button
          onClick={() => setActiveTab('CONTRACTS')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'CONTRACTS'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institutional Pharma Contracts ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUALITY_AUDIT')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'QUALITY_AUDIT'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>Moisture &amp; Lab Audits ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NEW_CONTRACT')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'NEW_CONTRACT'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Pharma Sourcing Agreement</span>
        </button>
      </div>

      {/* TAB 1: CONTRACTS LEDGER */}
      {activeTab === 'CONTRACTS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search contract ref, pharma company, cooperative..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              >
                <option value="ALL">All Contract Statuses</option>
                <option value="CONTRACT_ACTIVE">Active Contracts</option>
                <option value="INSPECTION_PENDING">Warehouse Inspection Pending</option>
                <option value="FULFILLED_ACCEPTED">Fulfilled &amp; Disbursed</option>
                <option value="REJECTED_NON_COMPLIANT">Rejected (Moisture/Purity Fail)</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {isContractsLoading ? (
              <div className="p-12 text-center text-gray-500 text-xs">Loading contracts...</div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs">No contracts match criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-3.5">Contract Ref</th>
                      <th className="px-5 py-3.5">Pharma Buyer &amp; Destination</th>
                      <th className="px-5 py-3.5">Grower Cooperative</th>
                      <th className="px-5 py-3.5">Species &amp; Weight</th>
                      <th className="px-5 py-3.5">Contract Escrow Value</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Intake Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                    {filteredContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                        <td className="px-5 py-4">
                          <div className="font-mono font-bold text-gray-900 dark:text-white">{c.contractNumber}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Due: {c.deliveryDeadline}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{c.buyerCompanyName}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{c.destinationWarehouseDistrict}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{c.cooperativeName}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">Contact: {c.buyerContactPerson}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {c.species} ({c.plantPart.replace(/_/g, ' ')})
                          </div>
                          <div className="text-emerald-600 font-bold mt-0.5">
                            {c.targetWeightKg.toLocaleString()} kg @ ৳{c.agreedPricePerKgBdt}/kg
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            ৳{Number(c.finalSettlementAmountBdt).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">
                            Advance Escrow (30%): ৳{Number(c.escrowAdvanceAmountBdt).toLocaleString()}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.contractStatus === 'FULFILLED_ACCEPTED'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : c.contractStatus === 'CONTRACT_ACTIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {c.contractStatus.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {c.contractStatus === 'CONTRACT_ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(c.id, 'FULFILLED_ACCEPTED')}
                              disabled={isUpdatingStatus}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept &amp; Settle</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-semibold">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUALITY AUDIT DESK */}
      {activeTab === 'QUALITY_AUDIT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900 dark:text-white">{b.species}</div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {b.gacpGrade.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="font-mono text-[10px] text-emerald-600">#{b.batchNumber}</div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tested Moisture:</span>
                  <span className="font-extrabold text-teal-600">{b.moistureContentPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purity Index:</span>
                  <span className="font-bold text-emerald-600">
                    {b.activePhytochemicalPercentage ? `${b.activePhytochemicalPercentage}%` : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock Weight:</span>
                  <span className="font-bold">{b.totalWeightKg.toLocaleString()} Kg</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{b.labReportNumber || 'Report DGDA-2026 Verified'}</span>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-400">
                <span>{b.cooperativeName}</span>
                <span>{b.growerDistrict}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CREATE CONTRACT */}
      {activeTab === 'NEW_CONTRACT' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-sm max-w-2xl mx-auto text-xs">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Issue Wholesale Pharma Sourcing Agreement (পাইকারি ভেষজ চুক্তি)
            </h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Lock advance escrow commitment and establish guaranteed farmgate price floor for rural herbal cooperatives.
            </p>
          </div>

          {contractCreatedMsg && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{contractCreatedMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateContract} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Pharmaceutical Buyer
                </label>
                <input
                  type="text"
                  required
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Buyer Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={buyerContact}
                  onChange={(e) => setBuyerContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Grower Cooperative
                </label>
                <input
                  type="text"
                  required
                  value={coopName}
                  onChange={(e) => setCoopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Medicinal Species
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                >
                  <option value="KALOMEGH">কালমেঘ (Kalomegh)</option>
                  <option value="ASHWAGANDHA">অশ্বগন্ধা (Ashwagandha)</option>
                  <option value="VASAKA">বাসক পাতা (Vasaka)</option>
                  <option value="TULSI_KRISHNA_RAMA">তুলসী পাতা (Tulsi)</option>
                  <option value="SHATAVARI">শতমূলী (Shatavari)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contract Volume (Kg)
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Agreed Rate/Kg (৳)
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={agreedPricePerKg}
                  onChange={(e) => setAgreedPricePerKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="flex justify-between">
                <span>Contract Total Valuation:</span>
                <span className="font-bold">৳{(targetWeightKg * agreedPricePerKg).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-teal-700 dark:text-teal-300 font-bold">
                <span>30% Advance Escrow Commitment:</span>
                <span>৳{Math.round(targetWeightKg * agreedPricePerKg * 0.3).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                disabled={isCreatingContract}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isCreatingContract ? 'Issuing Agreement...' : 'Sign & Issue Agreement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminPharmaRegulatoryHubView;
