# Electronics Taxonomy

Source of truth: `apps/api/src/seeder/data/electronics-taxonomy.data.ts`
(`ELECTRONICS_ATTRIBUTES`, `ELECTRONICS_TAXONOMY`, `ELECTRONICS_BRANDS`,
`ELECTRONICS_PRODUCTS`). Seeded by `SeederService.seedElectronicsCatalog()`.

## 1. Major groups

```text
Electronics
├── Computers & PC        (computers-pc)
├── Mobile & Tablet       (mobile-tablet)
├── Networking            (networking)
├── Gaming                (gaming)
├── Audio                 (audio)
├── TV & Entertainment    (tv-entertainment)
├── Camera & Photography  (camera-photography)
├── Smart Devices         (smart-devices)
├── Office Electronics    (office-electronics)
├── Power & Electrical    (power-electrical)
├── Lighting              (lighting)
├── Cables & Adapters     (cables-adapters)
├── Home Appliances       (home-appliances)
└── Computer Accessories  (computer-accessories)
```

`Computer Accessories`, `Mobile Accessories`, `Lighting` and `Home Appliances`
reuse the slugs that existed before the rebuild, so legacy products and the bulk
importer mapping continue to work (backward compatibility).

## 2. Computers & PC

```text
Computers & PC
├── Desktop PC            (product type: desktop-pc)
│   ├── Gaming PC · Office PC · Home PC · Workstation · Mini PC · All-in-One PC
├── PC Components
│   ├── Processor          (product type: processor)
│   ├── Motherboard        (product type: motherboard)
│   ├── Graphics Card      (product type: graphics-card)
│   ├── RAM                (product type: ram)
│   ├── SSD                (product type: ssd)
│   ├── HDD                (product type: hdd)
│   ├── Power Supply       (product type: power-supply)
│   ├── PC Case · CPU Cooler · Case Fan · Thermal Accessories
├── Laptop                 (product type: laptop)
│   ├── Gaming / Business / Student / Ultrabook / 2-in-1 / MacBook / Workstation
├── Monitor & Display      (product type: monitor)
│   ├── Gaming / Office / Professional / Ultrawide / Curved / 4K / Portable
└── Storage
    ├── Internal SSD (product type) · External SSD · Internal HDD · External HDD
    ├── Memory Card · USB Flash Drive
```

Resulting depth: `electronics → computers-pc → pc-components → processor`
(level 3), proving the hierarchy is not length-limited.

## 3. Attribute schemas

All attributes are global and reusable. Mappings per product type:

**Processor** — series, generation, socket, architecture, cores, threads,
base-clock, boost-clock, cache, tdp, integrated-graphics, box-type, warranty.

**Motherboard** — socket, chipset, form-factor, ram-type, ram-slots, max-ram,
m2-slots, pcie-version, wifi, bluetooth, lan, warranty.

**Graphics Card** — gpu-manufacturer, gpu-model, vram, vram-type, memory-bus,
boost-clock, gpu-interface, power-requirement, recommended-psu, length, cooling,
warranty.

**RAM** — generation, capacity, speed, module-type, kit, cas-latency, ecc, rgb,
warranty.

**SSD / HDD** — capacity, storage-interface, form-factor, read-speed, write-speed,
rpm, nand-type, tbw, warranty.

**Laptop** — processor, generation, ram, ram-type, storage, gpu, screen-size,
resolution, panel-type, refresh-rate, operating-system, battery, weight, ports,
keyboard, warranty.

**Monitor** — screen-size, resolution, panel-type, refresh-rate, response-time,
brightness, hdr, adaptive-sync, color-gamut, ports, curved, vesa-mount, warranty.

**Router (networking)** — wifi-generation, data-rate, bands, lan-ports, wan-ports,
poe, coverage, management, warranty.

Data types: `TEXT`, `NUMBER`, `BOOLEAN`, `SELECT`, `MULTI_SELECT`, `RANGE`,
`DATE`. `capacity` is marked `isVariantAxis`.

## 4. Representative seed products

| Product | Category path | Product type |
| --- | --- | --- |
| AMD Ryzen 5 7600 | …/pc-components/processor | processor |
| Intel Core i5-14400F | …/pc-components/processor | processor |
| ASUS PRIME B650M-A WIFI | …/pc-components/motherboard | motherboard |
| MSI RTX 4060 VENTUS 2X | …/pc-components/graphics-card | graphics-card |
| Corsair Vengeance DDR5 16GB | …/pc-components/ram | ram |
| Samsung 980 PRO (1TB / 2TB variants) | …/pc-components/ssd | ssd |
| ASUS TUF Gaming A15 (variants) | …/laptop/gaming-laptop | laptop |
| Samsung Odyssey G5 27" | …/monitor-display/gaming-monitor | monitor |
| TP-Link Archer AX55 | networking/wifi-router | router |

Each product carries structured specs (`product_attribute_values`); multi-variant
products create distinct variants with their own SKU, listing and inventory.

## 5. Verify the seed

```bash
pnpm -C apps/api run build && pnpm -C apps/api run seed
```

Expected slice totals: ~163 Electronics categories, 15 product types,
77 attributes, 161 options, 149 mappings, 104 spec values, 9 products.

## 6. Extending Electronics

1. Add the node to `ELECTRONICS_TAXONOMY`.
2. Add any new attribute to `ELECTRONICS_ATTRIBUTES` and reference it from the
   product type's `attributes` array.
3. (Optional) add a representative product to `ELECTRONICS_PRODUCTS`.
4. Re-run the seeder — it is idempotent and never duplicates records.
