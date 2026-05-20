-- Seed portfolio projects from Kenny0711/Nycu-Deep-learning-2026.
-- Run supabase/schema.sql first, then run this file.

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Backpropagation from Scratch',
  'Goal: Build and train a fully connected neural network from scratch using only Python and NumPy. This project focuses on understanding the mechanics behind forward propagation, manual backpropagation, activation functions, SGD, and momentum-based optimization by validating the model on XOR and linear classification tasks.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%201',
  '/projects/backpropagation.svg',
  array['NumPy', 'Backpropagation', 'MLP'],
  false
where not exists (select 1 from public.projects where title = 'Backpropagation from Scratch');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Binary Semantic Segmentation',
  'Goal: Train image segmentation models that can separate pet foregrounds from backgrounds on the Oxford-IIIT Pet dataset. The implementation compares UNet and ResNet34-UNet, builds the full PyTorch training and evaluation pipeline, and uses Dice score plus inference outputs to measure segmentation quality.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%202',
  '/projects/segmentation.svg',
  array['PyTorch', 'UNet', 'Segmentation'],
  false
where not exists (select 1 from public.projects where title = 'Binary Semantic Segmentation');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'MaskGIT Image Inpainting',
  'Goal: Use a pretrained VQGAN tokenizer with a Masked Bidirectional Transformer to reconstruct masked image regions through iterative token prediction. The work explores mask scheduling, transformer-based visual token modeling, image inpainting inference, and FID-based evaluation of generative quality.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%203',
  '/projects/maskgit.svg',
  array['PyTorch', 'VQGAN', 'Transformer'],
  false
where not exists (select 1 from public.projects where title = 'MaskGIT Image Inpainting');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Conditional VAE Video Prediction',
  'Goal: Implement stochastic video generation with a learned prior to predict future dance frames from conditional signals. This project studies Conditional VAE training, the reparameterization trick, KL annealing, teacher forcing schedules, reconstruction loss, and PSNR evaluation over long video sequences.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%204',
  '/projects/video-vae.svg',
  array['PyTorch', 'CVAE', 'Video Prediction'],
  true
where not exists (select 1 from public.projects where title = 'Conditional VAE Video Prediction');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Deep Q-Network Control',
  'Goal: Implement Deep Q-Network agents and variants for discrete control tasks. The project emphasizes reinforcement learning fundamentals including experience replay, target networks, value estimation, exploration, evaluation rollouts, and recorded videos that make policy behavior easier to inspect.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%205',
  '/projects/dqn-control.svg',
  array['PyTorch', 'DQN', 'Reinforcement Learning'],
  false
where not exists (select 1 from public.projects where title = 'Deep Q-Network Control');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Kenny''s Dev Hub',
  'Goal: Build a personal research and development portal that integrates portfolio projects, LeetCode tracking, solution notes, and admin workflows. The system combines Next.js, Supabase, Chrome Extension sync, secure server actions, and dashboard analytics into one maintainable learning hub.',
  'https://github.com/Kenny0711/kennys-hub',
  '/projects/dev-hub.svg',
  array['Next.js', 'Supabase', 'Chrome Extension'],
  true
where not exists (select 1 from public.projects where title = 'Kenny''s Dev Hub');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'Conditional DDPM Image Generation',
  'Goal: Build a conditional denoising diffusion model that generates iCLEVR images from multi-label object conditions. The implementation combines a conditional UNet, cosine noise scheduling, classifier-free guidance, AdamW training, inference scale sweeps, and evaluator-based accuracy checks.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%206',
  '/projects/ddpm-generation.svg',
  array['PyTorch', 'Diffusion', 'Generative AI'],
  false
where not exists (select 1 from public.projects where title = 'Conditional DDPM Image Generation');

insert into public.projects (title, description, project_url, image_url, tags, is_featured)
select
  'SUMO Traffic Simulation with LCPO',
  'Goal: Apply reinforcement learning to traffic signal control using SUMO and a Taipei road network. The project connects simulation engineering with RL policy design by building road topology from real data, constructing SUMO scenarios, and evaluating adaptive signal-control agents in traffic environments.',
  'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/final',
  '/projects/sumo-lcpo.svg',
  array['SUMO', 'RL', 'Traffic Simulation'],
  true
where not exists (select 1 from public.projects where title = 'SUMO Traffic Simulation with LCPO');

update public.projects
set is_featured = title in (
  'Conditional VAE Video Prediction',
  'Kenny''s Dev Hub',
  'SUMO Traffic Simulation with LCPO'
)
where title in (
  'Conditional VAE Video Prediction',
  'Kenny''s Dev Hub',
  'SUMO Traffic Simulation with LCPO',
  'Deep Q-Network Control'
);
