import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Apple, Moon, Dumbbell, Brain, Heart, Droplets, Sun, Eye, Shield, Pill, Baby, Flame, Search, Wind, Thermometer, Bone } from 'lucide-react';
import { Input } from '@/components/ui/input';

const tips = [
  { icon: Droplets, title: 'Stay Hydrated', tip: 'Drink 8 glasses of water daily. Carry a water bottle and set reminders.', color: 'from-blue-500 to-cyan-500', category: 'Hydration' },
  { icon: Droplets, title: 'Water Before Meals', tip: 'Drink a glass of water 30 minutes before meals to aid digestion.', color: 'from-blue-500 to-cyan-500', category: 'Hydration' },
  { icon: Droplets, title: 'Limit Sugary Drinks', tip: 'Replace sodas and juices with water, herbal tea, or infused water.', color: 'from-blue-400 to-cyan-400', category: 'Hydration' },
  { icon: Droplets, title: 'Check Urine Color', tip: 'Light yellow urine means good hydration. Dark yellow means drink more water.', color: 'from-blue-400 to-cyan-400', category: 'Hydration' },
  { icon: Moon, title: 'Consistent Sleep Schedule', tip: 'Go to bed and wake up at the same time every day, even weekends.', color: 'from-indigo-500 to-purple-500', category: 'Sleep' },
  { icon: Moon, title: 'No Screens Before Bed', tip: 'Avoid phones and screens 1 hour before sleep. Blue light disrupts melatonin.', color: 'from-indigo-500 to-purple-500', category: 'Sleep' },
  { icon: Moon, title: 'Optimize Sleep Environment', tip: 'Keep bedroom cool (65-68°F), dark, and quiet for best sleep quality.', color: 'from-indigo-400 to-purple-400', category: 'Sleep' },
  { icon: Moon, title: 'Limit Caffeine After 2 PM', tip: 'Caffeine stays in your body 6-8 hours. Avoid it in the afternoon.', color: 'from-indigo-400 to-purple-400', category: 'Sleep' },
  { icon: Moon, title: 'Power Naps', tip: 'If tired, take a 20-minute nap before 3 PM. Longer naps disrupt night sleep.', color: 'from-indigo-500 to-violet-500', category: 'Sleep' },
  { icon: Moon, title: 'Wind Down Routine', tip: 'Create a relaxing routine before bed: reading, stretching, or meditation.', color: 'from-indigo-500 to-violet-500', category: 'Sleep' },
  { icon: Dumbbell, title: '150 Min Weekly Exercise', tip: 'Aim for 150 minutes of moderate activity weekly. Even a 10-minute walk helps!', color: 'from-green-500 to-emerald-500', category: 'Exercise' },
  { icon: Dumbbell, title: 'Take Stairs', tip: 'Choose stairs over elevators. Small choices add up to significant fitness gains.', color: 'from-green-500 to-emerald-500', category: 'Exercise' },
  { icon: Dumbbell, title: 'Stretch Daily', tip: 'Spend 5-10 minutes stretching every morning to improve flexibility.', color: 'from-green-400 to-emerald-400', category: 'Exercise' },
  { icon: Dumbbell, title: 'Stand Up Every Hour', tip: 'If you sit for work, stand and move for 5 minutes every hour.', color: 'from-green-400 to-emerald-400', category: 'Exercise' },
  { icon: Dumbbell, title: 'Walk After Meals', tip: 'A 10-15 minute walk after meals helps digestion and blood sugar.', color: 'from-green-500 to-teal-500', category: 'Exercise' },
  { icon: Dumbbell, title: 'Mix Cardio & Strength', tip: 'Combine aerobic exercise with strength training for complete fitness.', color: 'from-green-500 to-teal-500', category: 'Exercise' },
  { icon: Dumbbell, title: 'Start Small', tip: 'If new to exercise, start with 10 minutes daily and increase gradually.', color: 'from-green-400 to-teal-400', category: 'Exercise' },
  { icon: Bone, title: 'Good Posture', tip: 'Sit with back straight, shoulders relaxed, feet flat on floor. Prevent back pain.', color: 'from-gray-500 to-slate-500', category: 'Exercise' },
  { icon: Apple, title: 'Eat the Rainbow', tip: 'Eat colorful fruits & vegetables. Different colors provide different nutrients.', color: 'from-red-500 to-orange-500', category: 'Nutrition' },
  { icon: Apple, title: 'Read Food Labels', tip: 'Check ingredients, sugar content, and serving sizes before buying.', color: 'from-red-500 to-orange-500', category: 'Nutrition' },
  { icon: Apple, title: 'Limit Processed Foods', tip: 'Cook meals at home using fresh ingredients as much as possible.', color: 'from-red-400 to-orange-400', category: 'Nutrition' },
  { icon: Apple, title: 'Eat More Fiber', tip: 'Include whole grains, beans, fruits, and vegetables for digestive health.', color: 'from-red-400 to-orange-400', category: 'Nutrition' },
  { icon: Apple, title: 'Healthy Snacking', tip: 'Choose nuts, fruits, yogurt, or veggies over chips and cookies.', color: 'from-orange-400 to-amber-400', category: 'Nutrition' },
  { icon: Apple, title: 'Portion Control', tip: 'Use smaller plates and serve yourself less. You can always take more.', color: 'from-orange-400 to-amber-400', category: 'Nutrition' },
  { icon: Apple, title: 'Eat Breakfast', tip: 'Start your day with protein and fiber-rich breakfast for sustained energy.', color: 'from-amber-400 to-yellow-400', category: 'Nutrition' },
  { icon: Apple, title: 'Limit Added Sugar', tip: 'Keep added sugar under 25g/day for women, 36g/day for men.', color: 'from-amber-400 to-yellow-400', category: 'Nutrition' },
  { icon: Apple, title: 'Eat Slowly', tip: 'Chew food thoroughly and eat mindfully. It takes 20 min to feel full.', color: 'from-orange-500 to-red-500', category: 'Nutrition' },
  { icon: Apple, title: 'Healthy Fats', tip: 'Include avocados, nuts, olive oil, and fatty fish for brain and heart health.', color: 'from-green-500 to-emerald-500', category: 'Nutrition' },
  { icon: Apple, title: 'Reduce Salt Intake', tip: 'Limit sodium to 2,300mg/day. Use herbs and spices for flavor instead.', color: 'from-blue-400 to-cyan-400', category: 'Nutrition' },
  { icon: Apple, title: 'Probiotics', tip: 'Eat yogurt, kefir, or fermented foods for gut health.', color: 'from-purple-400 to-pink-400', category: 'Nutrition' },
  { icon: Brain, title: 'Practice Mindfulness', tip: 'Spend 10 minutes daily in meditation or deep breathing exercises.', color: 'from-pink-500 to-rose-500', category: 'Mental Health' },
  { icon: Brain, title: 'Social Connections', tip: 'Stay connected with friends and family. Social bonds boost mental health.', color: 'from-pink-500 to-rose-500', category: 'Mental Health' },
  { icon: Brain, title: 'Limit Social Media', tip: 'Set daily time limits for social media to reduce anxiety and comparison.', color: 'from-pink-400 to-rose-400', category: 'Mental Health' },
  { icon: Brain, title: 'Gratitude Practice', tip: 'Write 3 things you\'re grateful for daily. It rewires your brain for positivity.', color: 'from-pink-400 to-rose-400', category: 'Mental Health' },
  { icon: Brain, title: 'Take Breaks', tip: 'Use the 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds.', color: 'from-violet-500 to-purple-500', category: 'Mental Health' },
  { icon: Brain, title: 'Learn Something New', tip: 'Challenge your brain daily with puzzles, reading, or learning a new skill.', color: 'from-violet-500 to-purple-500', category: 'Mental Health' },
  { icon: Brain, title: 'Say No When Needed', tip: 'Setting boundaries is essential for mental health. Don\'t overcommit.', color: 'from-violet-400 to-purple-400', category: 'Mental Health' },
  { icon: Brain, title: 'Journaling', tip: 'Write down your thoughts and feelings to process emotions healthily.', color: 'from-violet-400 to-purple-400', category: 'Mental Health' },
  { icon: Brain, title: 'Nature Time', tip: 'Spend at least 20 minutes in nature daily. It reduces stress hormones.', color: 'from-green-500 to-emerald-500', category: 'Mental Health' },
  { icon: Brain, title: 'Deep Breathing', tip: 'Try 4-7-8 breathing: inhale 4 sec, hold 7 sec, exhale 8 sec for calm.', color: 'from-blue-400 to-indigo-400', category: 'Mental Health' },
  { icon: Heart, title: 'Monitor Blood Pressure', tip: 'Check blood pressure regularly. Aim for below 120/80 mmHg.', color: 'from-red-600 to-pink-600', category: 'Heart Health' },
  { icon: Heart, title: 'Limit Sodium', tip: 'Reduce salt to help maintain healthy blood pressure levels.', color: 'from-red-600 to-pink-600', category: 'Heart Health' },
  { icon: Heart, title: 'Know Your Numbers', tip: 'Track cholesterol, blood sugar, BMI, and blood pressure annually.', color: 'from-red-500 to-pink-500', category: 'Heart Health' },
  { icon: Heart, title: 'Don\'t Smoke', tip: 'Smoking is the #1 preventable cause of death. Seek help to quit.', color: 'from-red-500 to-pink-500', category: 'Heart Health' },
  { icon: Heart, title: 'Manage Stress', tip: 'Chronic stress damages your heart. Find healthy stress outlets.', color: 'from-red-400 to-pink-400', category: 'Heart Health' },
  { icon: Heart, title: 'Limit Alcohol', tip: 'If you drink, limit to 1 drink/day (women) or 2 drinks/day (men).', color: 'from-red-400 to-pink-400', category: 'Heart Health' },
  { icon: Sun, title: 'Get Vitamin D', tip: 'Get 15-20 minutes of sunlight daily or consider supplements.', color: 'from-yellow-500 to-orange-500', category: 'Vitamins' },
  { icon: Sun, title: 'Wear Sunscreen', tip: 'Apply SPF 30+ sunscreen daily, even on cloudy days. Reapply every 2 hours.', color: 'from-yellow-500 to-orange-500', category: 'Skin Care' },
  { icon: Sun, title: 'Protect Your Skin', tip: 'Wear hats and protective clothing during peak sun hours (10 AM - 4 PM).', color: 'from-yellow-400 to-orange-400', category: 'Skin Care' },
  { icon: Sun, title: 'Moisturize Daily', tip: 'Apply moisturizer after showering to lock in hydration.', color: 'from-yellow-400 to-orange-400', category: 'Skin Care' },
  { icon: Lightbulb, title: 'Regular Checkups', tip: 'Schedule annual health checkups even if you feel healthy.', color: 'from-amber-500 to-yellow-500', category: 'Preventive Care' },
  { icon: Lightbulb, title: 'Stay Vaccinated', tip: 'Keep up with recommended vaccines including annual flu shots.', color: 'from-amber-500 to-yellow-500', category: 'Preventive Care' },
  { icon: Lightbulb, title: 'Dental Checkups', tip: 'Visit the dentist every 6 months for cleaning and checkup.', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Lightbulb, title: 'Eye Exams', tip: 'Get comprehensive eye exam every 1-2 years, more often if you wear glasses.', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Eye, title: 'Protect Your Eyes', tip: 'Follow the 20-20-20 rule when using screens to prevent eye strain.', color: 'from-blue-500 to-teal-500', category: 'Eye Health' },
  { icon: Eye, title: 'Blue Light Filter', tip: 'Use blue light glasses or screen filters, especially in the evening.', color: 'from-blue-500 to-teal-500', category: 'Eye Health' },
  { icon: Shield, title: 'Wash Hands Often', tip: 'Wash hands for 20 seconds with soap, especially before eating.', color: 'from-teal-500 to-cyan-500', category: 'Hygiene' },
  { icon: Shield, title: 'Oral Hygiene', tip: 'Brush twice daily for 2 minutes and floss once daily.', color: 'from-teal-500 to-cyan-500', category: 'Hygiene' },
  { icon: Shield, title: 'Clean Your Phone', tip: 'Your phone has more bacteria than a toilet seat. Clean it daily.', color: 'from-teal-400 to-cyan-400', category: 'Hygiene' },
  { icon: Shield, title: 'Change Pillowcase Weekly', tip: 'Pillowcases collect oil, bacteria, and dead skin. Change them often.', color: 'from-teal-400 to-cyan-400', category: 'Hygiene' },
  { icon: Pill, title: 'Know Your Medications', tip: 'Keep a list of all medications, dosages, and allergies on your phone.', color: 'from-blue-500 to-indigo-500', category: 'Medication' },
  { icon: Pill, title: 'Don\'t Skip Doses', tip: 'Take prescribed medications consistently. Set alarms as reminders.', color: 'from-blue-500 to-indigo-500', category: 'Medication' },
  { icon: Pill, title: 'Check Expiry Dates', tip: 'Regularly check and discard expired medications from your cabinet.', color: 'from-blue-400 to-indigo-400', category: 'Medication' },
  { icon: Baby, title: 'Kids Need 9-12 Hours Sleep', tip: 'School-age children need 9-12 hours of sleep for proper development.', color: 'from-pink-500 to-rose-500', category: 'Children' },
  { icon: Baby, title: 'Limit Screen Time for Kids', tip: 'Children under 2: no screens. Ages 2-5: max 1 hour/day of quality content.', color: 'from-pink-500 to-rose-500', category: 'Children' },
  { icon: Baby, title: 'Kids\' Nutrition', tip: 'Children need calcium-rich foods for growing bones: milk, cheese, yogurt.', color: 'from-pink-400 to-rose-400', category: 'Children' },
  { icon: Wind, title: 'Practice Deep Breathing', tip: 'Deep diaphragmatic breathing reduces stress and improves lung capacity.', color: 'from-blue-400 to-cyan-400', category: 'Breathing' },
  { icon: Wind, title: 'Good Indoor Air Quality', tip: 'Open windows daily, use air purifiers, and keep indoor plants.', color: 'from-blue-400 to-cyan-400', category: 'Breathing' },
  { icon: Flame, title: 'First Aid Kit', tip: 'Keep a stocked first aid kit at home and in your car.', color: 'from-orange-500 to-amber-500', category: 'Safety' },
  { icon: Flame, title: 'Fire Safety', tip: 'Test smoke alarms monthly. Have a fire escape plan and practice it.', color: 'from-orange-500 to-amber-500', category: 'Safety' },
  { icon: Shield, title: 'Wear Seatbelts', tip: 'Always wear seatbelts. They reduce risk of death by 45% in cars.', color: 'from-gray-500 to-slate-500', category: 'Safety' },
  { icon: Shield, title: 'Helmet Safety', tip: 'Always wear helmets when cycling, skating, or riding motorcycles.', color: 'from-gray-500 to-slate-500', category: 'Safety' },
  { icon: Thermometer, title: 'Know Normal Vital Signs', tip: 'Normal: HR 60-100, BP <120/80, Temp 97-99°F, SpO2 95-100%.', color: 'from-orange-500 to-red-500', category: 'Vital Signs' },
  { icon: Heart, title: 'Learn CPR', tip: 'Take a CPR course. You could save a life. It only takes 2-4 hours.', color: 'from-red-500 to-rose-500', category: 'Safety' },
  { icon: Apple, title: 'Meal Prep Sundays', tip: 'Prepare meals for the week on Sunday to eat healthier and save time.', color: 'from-green-500 to-emerald-500', category: 'Nutrition' },
  { icon: Dumbbell, title: 'Find Exercise You Enjoy', tip: 'You\'re more likely to stick with exercise if it\'s fun: dancing, swimming, sports.', color: 'from-green-500 to-teal-500', category: 'Exercise' },
  { icon: Brain, title: 'Seek Help When Needed', tip: 'It\'s okay to talk to a professional about mental health. It\'s not weakness.', color: 'from-purple-500 to-indigo-500', category: 'Mental Health' },
  { icon: Lightbulb, title: 'Ergonomic Workspace', tip: 'Set up your desk properly: screen at eye level, chair supporting lower back.', color: 'from-amber-500 to-yellow-500', category: 'Preventive Care' },
  { icon: Droplets, title: 'Electrolyte Balance', tip: 'When exercising heavily or in heat, replenish electrolytes, not just water.', color: 'from-blue-500 to-cyan-500', category: 'Hydration' },
  { icon: Apple, title: 'Omega-3 Fatty Acids', tip: 'Eat fish 2x/week for omega-3s that protect heart and brain health.', color: 'from-blue-400 to-teal-400', category: 'Nutrition' },
  { icon: Moon, title: 'Avoid Heavy Meals Before Bed', tip: 'Finish eating 2-3 hours before bedtime for better sleep quality.', color: 'from-indigo-400 to-purple-400', category: 'Sleep' },
  { icon: Shield, title: 'Keep Emergency Contacts', tip: 'Store emergency contacts in your phone. Let someone know your medical history.', color: 'from-red-500 to-rose-500', category: 'Safety' },
  { icon: Brain, title: 'Digital Detox', tip: 'Take 1 day per week completely off screens. Your brain needs the rest.', color: 'from-violet-500 to-purple-500', category: 'Mental Health' },
  { icon: Dumbbell, title: 'Core Strengthening', tip: 'A strong core prevents back pain. Do planks and bridges daily.', color: 'from-green-500 to-emerald-500', category: 'Exercise' },
  { icon: Apple, title: 'Iron-Rich Foods', tip: 'Include spinach, lentils, red meat, and fortified cereals to prevent anemia.', color: 'from-red-400 to-pink-400', category: 'Nutrition' },
  { icon: Shield, title: 'Know Your Blood Type', tip: 'Keep your blood type noted in your phone in case of emergency.', color: 'from-red-500 to-rose-500', category: 'Safety' },
  { icon: Lightbulb, title: 'Skin Self-Exam', tip: 'Check your skin monthly for new moles or changes in existing ones (ABCDE rule).', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Heart, title: 'Laughter is Medicine', tip: 'Laughing reduces stress hormones and boosts immune system.', color: 'from-pink-400 to-rose-400', category: 'Heart Health' },
  { icon: Droplets, title: 'Coconut Water', tip: 'Natural coconut water is a great low-calorie hydration option with electrolytes.', color: 'from-green-400 to-teal-400', category: 'Hydration' },
  { icon: Brain, title: 'Music Therapy', tip: 'Listening to calming music reduces anxiety and improves mood by 65%.', color: 'from-violet-400 to-purple-400', category: 'Mental Health' },
  { icon: Apple, title: 'Eat Berries Daily', tip: 'Blueberries, strawberries, raspberries are packed with antioxidants for brain health.', color: 'from-purple-400 to-pink-400', category: 'Nutrition' },
  { icon: Shield, title: 'Food Safety', tip: 'Store food properly. Follow the 2-hour rule: refrigerate leftovers within 2 hours.', color: 'from-teal-400 to-cyan-400', category: 'Safety' },
  { icon: Dumbbell, title: 'Balance Exercises', tip: 'Practice standing on one foot. Good balance prevents falls at any age.', color: 'from-green-400 to-emerald-400', category: 'Exercise' },
  { icon: Pill, title: 'Vitamin C Daily', tip: 'Get vitamin C from citrus fruits, bell peppers, and broccoli for immunity.', color: 'from-orange-400 to-yellow-400', category: 'Vitamins' },
  { icon: Sun, title: 'Morning Sunlight', tip: 'Get 10-15 minutes of morning sun to set your circadian rhythm.', color: 'from-yellow-500 to-amber-500', category: 'Sleep' },
  { icon: Brain, title: 'Positive Self-Talk', tip: 'Replace negative thoughts with positive affirmations. It changes brain patterns.', color: 'from-pink-400 to-rose-400', category: 'Mental Health' },
  { icon: Apple, title: 'Anti-Inflammatory Foods', tip: 'Turmeric, ginger, green tea, and leafy greens fight chronic inflammation.', color: 'from-yellow-400 to-green-400', category: 'Nutrition' },
  { icon: Shield, title: 'Travel Health Kit', tip: 'Pack a mini health kit when traveling: medications, band-aids, hand sanitizer.', color: 'from-teal-500 to-cyan-500', category: 'Safety' },
  { icon: Heart, title: 'Hug More', tip: 'Hugging releases oxytocin. Aim for 4 hugs a day for emotional wellbeing.', color: 'from-pink-500 to-rose-500', category: 'Heart Health' },
  { icon: Lightbulb, title: 'Posture Check Alarm', tip: 'Set hourly alarms to check and correct your posture throughout the day.', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Droplets, title: 'Herbal Teas', tip: 'Chamomile, peppermint, and ginger teas have various health benefits.', color: 'from-green-400 to-teal-400', category: 'Hydration' },
  { icon: Dumbbell, title: 'Yoga Benefits', tip: 'Yoga improves flexibility, strength, balance, and mental clarity.', color: 'from-purple-400 to-indigo-400', category: 'Exercise' },
  { icon: Brain, title: 'Creative Hobbies', tip: 'Painting, music, or crafting reduces cortisol by up to 75%.', color: 'from-violet-500 to-purple-500', category: 'Mental Health' },
  { icon: Apple, title: 'Calcium Sources', tip: 'Beyond dairy: broccoli, almonds, sardines, and fortified plant milks have calcium.', color: 'from-blue-400 to-cyan-400', category: 'Nutrition' },
  { icon: Moon, title: 'Magnesium for Sleep', tip: 'Magnesium-rich foods (bananas, almonds, dark chocolate) improve sleep quality.', color: 'from-indigo-500 to-purple-500', category: 'Sleep' },
  { icon: Shield, title: 'Know Signs of Depression', tip: 'Persistent sadness >2 weeks, loss of interest, fatigue — seek professional help.', color: 'from-purple-500 to-indigo-500', category: 'Mental Health' },
  { icon: Lightbulb, title: 'Hearing Protection', tip: 'Use ear protection when exposed to loud noises above 85 decibels.', color: 'from-amber-500 to-yellow-500', category: 'Preventive Care' },
  { icon: Heart, title: 'Pet a Dog', tip: 'Interacting with animals reduces blood pressure and stress. Consider pet therapy.', color: 'from-amber-400 to-orange-400', category: 'Heart Health' },
  { icon: Apple, title: 'Fermented Foods', tip: 'Kimchi, sauerkraut, miso, and kombucha support gut microbiome diversity.', color: 'from-green-500 to-teal-500', category: 'Nutrition' },
  { icon: Shield, title: 'Home Safety Check', tip: 'Check smoke detectors, secure rugs, and remove tripping hazards regularly.', color: 'from-gray-500 to-slate-500', category: 'Safety' },
  { icon: Brain, title: 'Practice Forgiveness', tip: 'Holding grudges increases stress and blood pressure. Let go for YOUR health.', color: 'from-pink-400 to-rose-400', category: 'Mental Health' },
  { icon: Dumbbell, title: 'Swimming Benefits', tip: 'Swimming is a full-body, low-impact exercise great for all ages and fitness levels.', color: 'from-blue-500 to-cyan-500', category: 'Exercise' },
  { icon: Apple, title: 'Limit Ultra-Processed Food', tip: 'Ultra-processed foods are linked to obesity, heart disease, and depression.', color: 'from-red-400 to-orange-400', category: 'Nutrition' },
  { icon: Lightbulb, title: 'Health Insurance Review', tip: 'Review your health insurance annually. Understand what\'s covered before you need it.', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Wind, title: 'Nose Breathing', tip: 'Breathe through your nose, not mouth. Nose filters, warms, and humidifies air.', color: 'from-blue-400 to-cyan-400', category: 'Breathing' },
  { icon: Droplets, title: 'Morning Water', tip: 'Drink a glass of water first thing in the morning to kickstart your metabolism.', color: 'from-blue-500 to-cyan-500', category: 'Hydration' },
  { icon: Brain, title: 'Volunteer Work', tip: 'Helping others releases endorphins and reduces depression risk by 20%.', color: 'from-green-400 to-teal-400', category: 'Mental Health' },
  { icon: Shield, title: 'CPR Training', tip: 'Everyone should know CPR. Free courses are available at local Red Cross chapters.', color: 'from-red-500 to-rose-500', category: 'Safety' },
  { icon: Apple, title: 'Spice It Up', tip: 'Spices like turmeric, cinnamon, and garlic have powerful health benefits.', color: 'from-orange-400 to-amber-400', category: 'Nutrition' },
  { icon: Moon, title: 'Weighted Blanket', tip: 'Weighted blankets can reduce anxiety and improve sleep quality.', color: 'from-indigo-400 to-purple-400', category: 'Sleep' },
  { icon: Heart, title: 'Dance Often', tip: 'Dancing combines exercise, music, and social connection — triple health benefit!', color: 'from-pink-500 to-rose-500', category: 'Heart Health' },
  { icon: Lightbulb, title: 'Medical ID on Phone', tip: 'Set up Medical ID on your phone with allergies, conditions, and emergency contacts.', color: 'from-amber-500 to-yellow-500', category: 'Safety' },
  { icon: Apple, title: 'Plant-Based Meals', tip: 'Try 1-2 plant-based meals per week. It benefits both health and the environment.', color: 'from-green-500 to-emerald-500', category: 'Nutrition' },
  { icon: Brain, title: 'Therapy is Normal', tip: 'Therapy isn\'t just for crises. Regular sessions help maintain mental wellness.', color: 'from-purple-500 to-indigo-500', category: 'Mental Health' },
  { icon: Dumbbell, title: 'Rest Days Matter', tip: 'Take 1-2 rest days per week. Muscles grow during recovery, not during exercise.', color: 'from-green-400 to-teal-400', category: 'Exercise' },
  { icon: Shield, title: 'Water Safety', tip: 'Never swim alone. Learn to swim. Supervise children constantly near water.', color: 'from-blue-500 to-indigo-500', category: 'Safety' },
  { icon: Apple, title: 'Mindful Eating', tip: 'Put away phones during meals. Focus on taste, texture, and fullness cues.', color: 'from-green-400 to-emerald-400', category: 'Nutrition' },
  { icon: Sun, title: 'Vitamin E', tip: 'Nuts, seeds, and spinach provide vitamin E for skin health and immunity.', color: 'from-yellow-400 to-amber-400', category: 'Vitamins' },
  { icon: Heart, title: 'Regular BP Monitoring', tip: 'Buy a home blood pressure monitor. Check weekly and log results.', color: 'from-red-500 to-pink-500', category: 'Heart Health' },
  { icon: Brain, title: 'Sleep Hygiene', tip: 'Reserve your bed for sleep only. Don\'t work, eat, or scroll in bed.', color: 'from-indigo-500 to-violet-500', category: 'Sleep' },
  { icon: Apple, title: 'Green Tea Benefits', tip: '2-3 cups of green tea daily provides antioxidants and boosts metabolism.', color: 'from-green-500 to-teal-500', category: 'Nutrition' },
  { icon: Lightbulb, title: 'Annual Blood Work', tip: 'Get comprehensive blood work done annually to catch issues early.', color: 'from-amber-500 to-yellow-500', category: 'Preventive Care' },
  { icon: Shield, title: 'Emergency Plan', tip: 'Have a family emergency plan: meeting points, contacts, essential supplies.', color: 'from-red-500 to-rose-500', category: 'Safety' },
  { icon: Droplets, title: 'Warm Lemon Water', tip: 'Start mornings with warm lemon water for vitamin C and digestion.', color: 'from-yellow-400 to-amber-400', category: 'Hydration' },
  { icon: Dumbbell, title: 'Walk 10,000 Steps', tip: 'Aim for 10,000 steps daily. Use a pedometer or phone to track.', color: 'from-green-500 to-emerald-500', category: 'Exercise' },
  { icon: Brain, title: 'Limit News Consumption', tip: 'Too much news increases anxiety. Set specific times to check news.', color: 'from-violet-400 to-purple-400', category: 'Mental Health' },
  { icon: Apple, title: 'Dark Chocolate', tip: '1-2 squares of 70%+ dark chocolate daily has heart and brain benefits.', color: 'from-amber-600 to-orange-600', category: 'Nutrition' },
  { icon: Shield, title: 'Organ Donor Registration', tip: 'Consider registering as an organ donor. One donor can save 8 lives.', color: 'from-red-400 to-pink-400', category: 'Preventive Care' },
  { icon: Heart, title: 'Gratitude Walk', tip: 'Combine walking with gratitude. Think of things you\'re thankful for while you walk.', color: 'from-green-400 to-teal-400', category: 'Heart Health' },
  { icon: Lightbulb, title: 'Keep Medical Records', tip: 'Maintain digital copies of your medical records, prescriptions, and test results.', color: 'from-amber-400 to-yellow-400', category: 'Preventive Care' },
  { icon: Brain, title: 'Art Therapy', tip: 'Coloring, drawing, or painting for 20 minutes reduces anxiety significantly.', color: 'from-pink-400 to-violet-400', category: 'Mental Health' },
  { icon: Dumbbell, title: 'Flexibility Training', tip: 'Spend 10 minutes stretching after exercise. Prevents injury and improves range of motion.', color: 'from-green-400 to-emerald-400', category: 'Exercise' },
  { icon: Apple, title: 'Avoid Late-Night Eating', tip: 'Stop eating 3 hours before bed. Late eating disrupts sleep and digestion.', color: 'from-indigo-400 to-purple-400', category: 'Nutrition' },
  { icon: Shield, title: 'Sun Safety for Kids', tip: 'Keep babies under 6 months out of direct sun. Use kid-safe SPF 30+ sunscreen.', color: 'from-yellow-400 to-orange-400', category: 'Children' },
  { icon: Heart, title: 'Forgive Yourself', tip: 'Self-compassion is linked to lower anxiety and depression. Be kind to yourself.', color: 'from-pink-400 to-rose-400', category: 'Mental Health' },
];

const tipCategories = [...new Set(tips.map(t => t.category))];

export default function HealthTipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = tips.filter(tip => {
    const matchesSearch = !searchTerm || tip.title.toLowerCase().includes(searchTerm.toLowerCase()) || tip.tip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Health Tips</h1>
            <p className="text-muted-foreground">{tips.length} wellness tips for a healthier lifestyle</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search health tips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              All ({tips.length})
            </button>
            {tipCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {cat} ({tips.filter(t => t.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.5) }}
                className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">{item.category}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
