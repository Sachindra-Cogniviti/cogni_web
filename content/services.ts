export const platformServices = [
  {
    slug: "coupa",
    name: "Coupa",
    title: "Coupa Implementation Services",
    description:
      "Coupa implementation, consulting, ERP integration and managed support for enterprise Source-to-Pay and procurement transformation.",
    heading: "Coupa implementation and consulting services",
    intro:
      "Cogniviti Labs delivers Coupa implementation, ERP integration and post-go-live support for enterprise procurement teams. We align Source-to-Pay workflows, supplier data and approval controls with the way your organisation operates.",
    sections: [
      {
        title: "Source-to-Pay implementation",
        body: "Start with procurement requirements and approval structures, then configure purchasing, supplier management and spend visibility around agreed processes. Testing covers the complete journey from requisition through invoicing, including exceptions and compliance controls.",
      },
      {
        title: "Coupa ERP integration and data readiness",
        body: "Connect Coupa with your ERP and related systems, including SAP and Oracle where required. Define supplier and accounting mappings, validate migration data and reconcile transactional flows so procurement and finance share consistent records.",
      },
      {
        title: "Coupa managed support and optimisation",
        body: "After go-live, support administration, integration monitoring and incremental enhancements. Review workflow friction and user questions to prioritise improvements in adoption, supplier enablement and day-to-day operations.",
      },
    ],
    faq: [
      {
        question: "What does a Coupa implementation include?",
        answer:
          "The scope is agreed around your processes and modules. It can include requirements assessment, configuration, supplier and master-data preparation, ERP integration, testing, rollout and adoption support.",
      },
      {
        question: "Can you support an existing Coupa deployment?",
        answer:
          "Yes. We support post-go-live administration, integrations and optimisation. An initial review establishes the current configuration, operational issues and priorities before a support scope is agreed.",
      },
    ],
    related: {
      label: "Prepare supplier master data",
      href: "/products/master-data-management/",
    },
  },
  {
    slug: "onestream",
    name: "OneStream",
    title: "OneStream Implementation & Consulting",
    description:
      "OneStream implementation and EPM consulting for financial close, consolidation, planning, budgeting, reporting and data integration.",
    heading: "OneStream implementation and EPM consulting",
    intro:
      "Cogniviti Labs implements and supports OneStream for finance teams working across multiple entities and currencies. Our EPM consulting brings financial close, consolidation, reporting and planning into a governed operating model.",
    sections: [
      {
        title: "Financial close and consolidation",
        body: "Align entity structures, chart of accounts and consolidation requirements with finance controls. Configure workflows and validation around the close process, with testing that checks data loads, reconciliation and reporting across entities and currencies.",
      },
      {
        title: "Planning, budgeting and forecasting",
        body: "Translate planning requirements into a consistent model for finance teams. Establish input workflows, assumptions and reporting needs so budgets and forecasts can be reviewed alongside financial results in OneStream.",
      },
      {
        title: "OneStream data integration and ongoing support",
        body: "Prepare source-system mappings, validate finance data and define repeatable load and reconciliation processes. Following deployment, support reliable reporting cycles and evolve the configuration as finance requirements change.",
      },
    ],
    faq: [
      {
        question: "Which OneStream processes do you support?",
        answer:
          "Our OneStream work covers financial close and consolidation, financial reporting, planning, budgeting, forecasting and data governance. The implementation scope is agreed against your finance requirements.",
      },
      {
        question: "How do you prepare data for a OneStream implementation?",
        answer:
          "We review entity and account structures, map source data, establish validation rules and test reconciliation before cutover. This helps finance teams understand and operate the data flows used in close and reporting.",
      },
    ],
    related: {
      label: "Explore master data governance",
      href: "/products/master-data-management/",
    },
  },
  {
    slug: "ivalua",
    name: "Ivalua",
    title: "Ivalua Implementation Services",
    description:
      "Ivalua implementation, consulting and integration services across sourcing, contracts, suppliers, procurement, invoicing and spend management.",
    heading: "Ivalua implementation and integration services",
    intro:
      "Cogniviti Labs implements and optimises Ivalua across the Source-to-Pay lifecycle. We bring sourcing, supplier management, contracts, procurement and invoicing into configurable workflows with clear controls and ownership.",
    sections: [
      {
        title: "Sourcing, contracts and supplier management",
        body: "Map requirements across strategic sourcing, contract management and supplier processes. Configure the platform around business responsibilities and governance so teams can follow the same records and controls through the procurement lifecycle.",
      },
      {
        title: "Procurement and invoicing workflows",
        body: "Connect procurement requirements with invoicing and spend management. Define approval structures and exception handling, then test the configured processes with business users to check transparency, consistency and operational fit.",
      },
      {
        title: "Ivalua integration, migration and support",
        body: "Plan ERP interfaces and data migration alongside configuration. Validate records and end-to-end flows before rollout, then support adoption and ongoing improvements after go-live as teams gain experience with the platform.",
      },
    ],
    faq: [
      {
        question: "Do you implement the full Ivalua Source-to-Pay lifecycle?",
        answer:
          "We work across sourcing, contracts, supplier management, procurement, invoicing and spend management. The modules and rollout sequence depend on your priorities and agreed project scope.",
      },
      {
        question: "Can Ivalua be integrated with our ERP?",
        answer:
          "We assess the interfaces offered by your ERP and the required data flows, then design mappings, migration and testing around those requirements. Integration scope is established during assessment.",
      },
    ],
    related: {
      label: "Explore enterprise integration delivery",
      href: "/products/cogniviti-bridge/",
    },
  },
  {
    slug: "gep",
    name: "GEP",
    title: "GEP SMART Implementation Services",
    description:
      "GEP SMART implementation, consulting and integration for sourcing, procurement, supplier management, spend analysis and data readiness.",
    heading: "GEP SMART implementation and consulting services",
    intro:
      "Cogniviti Labs implements and evolves GEP SMART across sourcing, procurement, supplier management and spend analysis. Assessment, configuration, integration and data readiness are planned together to support stable deployments.",
    sections: [
      {
        title: "Sourcing and procurement configuration",
        body: "Translate sourcing, contract and procurement requirements into workflows that reflect your operating model. Agree roles and governance early, then test configuration against realistic business scenarios before rollout.",
      },
      {
        title: "Supplier management and spend analysis",
        body: "Prepare supplier records and spend data alongside platform configuration. Align definitions, ownership and reporting needs so teams can use consistent information across sourcing decisions and procurement operations.",
      },
      {
        title: "GEP SMART integration and optimisation",
        body: "Define ERP and enterprise-system interfaces, validate migration data and test connected processes. Continue with post-go-live optimisation to address operational feedback, data quality and changing business requirements.",
      },
    ],
    faq: [
      {
        question: "What areas of GEP SMART do you support?",
        answer:
          "Our work spans sourcing, contracts, procurement, supplier management and spend analysis. We assess the required modules, interfaces and data readiness before agreeing the delivery scope.",
      },
      {
        question: "Do you provide support after a GEP rollout?",
        answer:
          "Yes. We continue with optimisation after go-live, reviewing operational feedback and priorities for configuration, integrations and data readiness within an agreed support scope.",
      },
    ],
    related: {
      label: "Explore procurement spend analytics",
      href: "/products/spend-analytics/",
    },
  },
] as const

export const serviceLinks = [
  { label: "All services", href: "/services/" },
  ...platformServices.map((platform) => ({
    label: `${platform.name} services`,
    href: `/services/${platform.slug}/`,
  })),
]
